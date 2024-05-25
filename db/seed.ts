import { db, eq, Result, sql } from 'astro:db';
import glob from 'fast-glob';
import fs from 'node:fs/promises';
import { TestResultOrError } from '../src/util/data-schema';
import { parseWithFriendlyErrors } from '../src/util/error-map';
import { blue, bold, dim, heading, red } from '../src/util/logging';

// https://astro.build/db/seed
export default async function seed() {
	const t0 = performance.now();
	console.log('\nPopulating database with test results...');
	const files = await glob(['./src/data/results/**/*.json']);
	console.log(`\Found ${files.length} data files to load.`);

	let exclusions = 0;
	let insertions = 0;
	const months: Record<string, string[]> = {};
	const reasons: Record<string, string[]> = {};
	const siteErrorMonths: Record<string, Date[]> = {};

	for (const file of files) {
		const [_dot, _src, _data, _results, siteHash, filename] = file.split('/');
		const content = JSON.parse(await fs.readFile(file, 'utf-8'));
		const runTimeString = filename.replace(/(^date-|\.json$)/g, '');
		const runTime = new Date(Number(runTimeString));
		const result = parseWithFriendlyErrors(TestResultOrError, content);
		if (result.success && !('error' in result.data)) {
			await db.insert(Result).values({ siteHash, runTime, data: result.data });
			insertions++;
		} else {
			const reasonSummary = !result.success
				? result.error.split('\n').slice(0, 2).join('\n')
				: 'error' in result.data
					? result.data.error
					: 'Unknown error.';
			exclusions++;
			const runMonth =
				new Date(Number(runTime)).getFullYear() * 100 + (new Date(Number(runTime)).getMonth() + 1);
			months[runMonth] ||= [];
			months[runMonth].push(file);
			reasons[reasonSummary] ||= [];
			reasons[reasonSummary].push(file);
			if (content.url) {
				siteErrorMonths[content.url] ||= [];
				siteErrorMonths[content.url].push(runTime);
			}
		}
	}

	printExclusionsReport({ insertions, exclusions, months, reasons, siteErrorMonths });

	const MaxTime = db
		.$with('MaxTime')
		.as(db.select({ latestRun: sql`max(${Result.runTime})`.as('latestRun') }).from(Result));
	const RecentRuns = db.$with('RecentRuns').as(
		db
			.with(MaxTime)
			.select({ recentSiteHash: Result.siteHash })
			.from(Result)
			.leftJoin(MaxTime, eq(MaxTime.latestRun, MaxTime.latestRun))
			.where(sql`unixepoch (${Result.runTime}) >= (unixepoch (latestRun) - 24 * 60 * 60)`)
	);
	const [{ missingInLatestRun }] = await db
		.with(RecentRuns)
		.select({ missingInLatestRun: sql<number>`count(DISTINCT ${Result.siteHash})` })
		.from(Result)
		.where(sql`${Result.siteHash} NOT IN ${RecentRuns}`);

	console.log(
		`\nDeleting data for ${missingInLatestRun} sites that are missing in the most recent set of tests...`
	);
	// Remove sites for which we don’t have good data for the most recent run.
	const { rowsAffected } = await db
		.with(RecentRuns)
		.delete(Result)
		.where(sql`${Result.siteHash} NOT IN ${RecentRuns}`);
	console.log(bold(`Deleted ` + red(`${rowsAffected} rows`)));

	const [{ finalSize }] = await db.select({ finalSize: sql<number>`count(*)` }).from(Result);
	const timeFormatter = new Intl.NumberFormat('en', { style: 'unit', unit: 'second' });
	const elapsed = timeFormatter.format((performance.now() - t0) / 1000);
	console.log(bold(`\nSeeded ${blue(finalSize + ' rows')} in ${elapsed}\n`));

	// // This SQL is equivalent to the ORM version above for deleting old sites.
	// await db.run(sql`
	// WITH RecentRuns AS (
	// 	WITH MaxTime AS (
	// 			SELECT
	// 				max(${Result.runTime}) AS latestRun
	// 			FROM
	// 				${Result}
	// 	)
	// 		SELECT
	// 			${Result.siteHash} AS recentSiteHash
	// 		FROM
	// 			${Result}
	// 			JOIN MaxTime
	// 		WHERE
	// 			unixepoch (${Result.runTime}) >= (unixepoch (latestRun) - 24 * 60 * 60)
	// 	)
	// 	DELETE
	// 	FROM
	// 		${Result}
	// 	WHERE
	// 		${Result.siteHash} NOT IN RecentRuns
	// `);
}

function printExclusionsReport({
	insertions,
	exclusions,
	months,
	reasons,
	siteErrorMonths,
}: {
	insertions: number;
	exclusions: number;
	months: Record<string, string[]>;
	reasons: Record<string, string[]>;
	siteErrorMonths: Record<string, Date[]>;
}) {
	console.log(bold('\nInserted data from ' + blue(`${insertions} files`)));
	console.log(bold('Excluded ' + red(`${exclusions} files\n`)));
	console.log(heading('Excluded files by month:\n'));
	Object.entries(months)
		.map(
			([month, files]) =>
				[parseInt(month), files.map(() => '█').join('') + dim(` (${files.length})`)] as const
		)
		.sort(([a], [b]) => a - b)
		.map(([month, count]) => [String(month).slice(0, 4) + '/' + String(month).slice(4), count])
		.forEach(([month, bar]) => console.log(`  ${month}  ${bar}`));

	console.log(heading('\nSchema parse errors:'));
	const displayedFileCount = 3;
	Object.entries(reasons)
		.sort(([, a], [, b]) => b.length - a.length)
		.forEach(([reason, files]) => {
			console.log();
			console.log(files.length, 'times:');
			console.log(reason);
			console.log(
				files
					.slice(0, displayedFileCount)
					.map((file) => dim(file.replace('./src/data/results/', '\t')))
					.join('  ')
			);
			if (files.length > displayedFileCount)
				console.log(dim(`\t+ ${files.length - displayedFileCount} more items`));
		});
	console.log();

	const threeMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 31 * 3;
	const problematicUrls = Object.entries(siteErrorMonths)
		.filter(
			([, dates]) =>
				dates.length > 2 &&
				// Check if the third most recent month was within the last three months:
				(dates
					.sort((a, b) => a.getTime() - b.getTime())
					.at(-3)
					?.getTime() || 0) > threeMonthsAgo
		)
		.map(([url]) => url);
	console.log(heading('Problematic sites:'));
	console.log();
	console.log(problematicUrls.length, 'sites errored for each of the last 3 months:');
	console.log(problematicUrls.map((url) => '\t' + dim(url)).join('\n'));
	console.log();
}
