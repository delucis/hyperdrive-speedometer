// @ts-check

const fs = require('fs').promises;
const shortHash = require('short-hash');
const PerfLeaderboard = require('performance-leaderboard');
const sites = require('../data/sites');

const NUMBER_OF_RUNS = 3;
const FREQUENCY = 60; // in minutes
const LONG_RUN_MS = 30_000; // in milliseconds

const prettyTime = (seconds) => {
	// Based on https://johnresig.com/blog/javascript-pretty-date/
	const days = Math.floor(seconds / (60 * 60 * 24));

	return (
		(days === 0 &&
			((seconds < 60 && 'just now') ||
				(seconds < 60 * 2 && '1 minute ago') ||
				(seconds < 3600 && Math.floor(seconds / 60) + ' minutes ago') ||
				(seconds < 7200 && '1 hour ago') ||
				(seconds < 86400 * 2 && Math.floor(seconds / 3600) + ' hours ago'))) ||
		(days < 7 && days + ' days ago') ||
		Math.ceil(days / 7) + ' weeks ago'
	);
};

(async function () {
	const dateTestsStarted = Date.now();
	const dataDir = `./src/data/`;
	const lastRunsFilename = `${dataDir}results-last-runs.json`;
	let lastRuns;
	try {
		lastRuns = require('.' + lastRunsFilename);
		console.log('Last runs at start: ', JSON.stringify(lastRuns));
	} catch (e) {
		console.log(`There are no known last run timestamps`);
		lastRuns = {};
	}

	class TimingStore {
		/** @type {Map<string, { runStart?: number, timings: number[] }>} */
		store = new Map();
		/** @param {string | undefined} url */
		trackRunStart(url) {
			if (!url) return;
			const { timings = [] } = this.store.get(url) || {};
			this.store.set(url, { timings, runStart: performance.now() });
		}
		/** @param {string | undefined} url */
		trackRunEnd(url) {
			if (!url) return;
			const { runStart, timings = [] } = this.store.get(url) || {};
			if (runStart) {
				const elapsedMs = performance.now() - runStart;
				timings.push(elapsedMs);
				if (elapsedMs > LONG_RUN_MS) {
					console.warn(`SLOW WEBSITE: ${url} took ${Math.round(elapsedMs / 1000)}s`);
				}
			}
			this.store.set(url, { timings });
		}
		printSummary() {
			console.log('\n\nSLOW WEBSITES THIS RUN');
			const sum = (numbers) => numbers.reduce((acc, i) => acc + i, 0);
			const sorted = [...this.store.entries()].sort(
				([, a], [, b]) => sum(b.timings) - sum(a.timings)
			);
			for (const [url, { timings }] of sorted) {
				if (timings.some((val) => val > LONG_RUN_MS)) {
					const timesInSeconds = timings.map((n) => Math.round(n / 1000) + 's').join(' / ');
					console.warn(`${url} — Run timings: ${timesInSeconds}`);
				}
			}
			console.log('\n\n');
		}
	}
	const timingStore = new TimingStore();

	for (let [key, groupOrGroupGetter] of Object.entries(sites)) {
		const group =
			typeof groupOrGroupGetter === 'function' ? await groupOrGroupGetter() : groupOrGroupGetter;

		if (group.skip) {
			console.log(`Skipping ${key} (you told me to in your site config)`);
			continue;
		}

		const runFrequency = group.options?.frequency || FREQUENCY;

		if (!lastRuns[key]) {
			console.log(`First tests for ${key}.`);
		} else {
			const lastRun = lastRuns[key];
			const lastRunSecondsAgo = (dateTestsStarted - lastRun.timestamp) / 1000;
			const lastRunSecondsAgoPretty = prettyTime(lastRunSecondsAgo);
			const lastRunMinutesAgo = lastRunSecondsAgo / 60;
			if (lastRunMinutesAgo < runFrequency) {
				console.log(
					`Previous test for ${key} ran ${lastRunSecondsAgoPretty}, less than ${runFrequency} minutes, skipping.`
				);
				continue;
			} else {
				console.log(
					`Previous test for ${key} ran ${lastRunSecondsAgoPretty}, more than ${runFrequency} minutes, running.`
				);
			}
		}

		const runCount = group.options?.runs || NUMBER_OF_RUNS;

		const results = await PerfLeaderboard(group.urls, runCount, {
			chromeFlags: ['--headless', '--disable-dev-shm-usage'],
			...group.options,
			beforeHook: (url) => timingStore.trackRunStart(url),
			afterHook: (o) => timingStore.trackRunEnd(o?.requestedUrl || o?.url),
		});

		const promises = [];
		for (const result of results) {
			const id = shortHash(result.url);
			const isIsolated = group.options && group.options.isolated;
			const dir = `${dataDir}results/${isIsolated ? `${key}/` : ''}${id}/`;

			const filename = `${dir}date-${dateTestsStarted}.json`;
			await fs.mkdir(dir, { recursive: true });
			promises.push(fs.writeFile(filename, JSON.stringify(result, null, 2)));
			console.log(`Writing ${filename}.`);
		}

		timingStore.printSummary();

		await Promise.all(promises);
		lastRuns[key] = { timestamp: Date.now() };
		console.log(`Finished testing "${key}".`);

		// Write the last run time to avoid re-runs
		await fs.writeFile(lastRunsFilename, JSON.stringify(lastRuns, null, 2));
		console.log(`Last runs after "${key}":`, JSON.stringify(lastRuns));
	}
})();
