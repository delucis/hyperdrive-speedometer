import z from 'astro/zod';

const TestError = z.object({
  error: z.string(),
});
const TestResult = z.object({
  timestamp: z.number(),
  url: z.string().url(),
  requestedUrl: z.string().url().optional(),
  ranks: z.object({
    hundos: z.number(),
    performance: z.number(),
    accessibility: z.number(),
    cumulative: z.number(),
  }),
  lighthouse: z.object({
    version: z.string(),
    performance: z.number(),
    accessibility: z.number(),
    bestPractices: z.number(),
    seo: z.number(),
    total: z.number(),
    type: z.string().optional(),
  }),
  firstContentfulPaint: z.number(),
  firstMeaningfulPaint: z.number(),
  speedIndex: z.number(),
  largestContentfulPaint: z.number(),
  totalBlockingTime: z.number(),
  cumulativeLayoutShift: z.number(),
  timeToInteractive: z.number(),
  maxPotentialFirstInputDelay: z.number(),
  timeToFirstByte: z.number(),
  weight: z.object({
    summary: z.string(),
    total: z.number(),
    image: z.number(),
    imageCount: z.number(),
    script: z.number(),
    scriptCount: z.number(),
    document: z.number(),
    font: z.number(),
    fontCount: z.number(),
    stylesheet: z.number(),
    stylesheetCount: z.number(),
    thirdParty: z.number(),
    thirdPartyCount: z.number(),
  }),
  run: z.object({
    number: z.number(),
    total: z.number(),
  }),
  // sidequests: z.object({
  //   '-weight.total': z.number(),
  //   '+weight.total': z.number(),
  //   '-weight.document': z.number(),
  //   '+weight.document': z.number(),
  //   '-weight.script': z.number(),
  //   '+weight.script': z.number(),
  //   '-weight.image': z.number(),
  //   '+weight.image': z.number(),
  //   '-weight.font': z.number(),
  //   '+weight.font': z.number(),
  //   '+weight.fontCount': z.number(),
  //   '-timeToFirstByte': z.number(),
  //   '-totalBlockingTime': z.number(),
  //   '-largestContentfulPaint': z.number(),
  // }),
  axe: z.object({
    passes: z.number(),
    violations: z.number(),
    error: z.boolean().default(false),
  }),
});

const TestResultOrError = z.union([TestResult, TestError]);
export type TestData = z.infer<typeof TestResult>;

/**
 * Group JSON data for each site.
 * @param globMap Map of path to file content returned by `import.meta.globEager`
 * @returns Array of objects, one for each site.
 */
function groupSites(globMap: {
  [path: string]: TestData;
}): { [date: string]: TestData }[] {
  const results: { [siteHash: string]: { [date: string]: TestData } } = {};
  for (const [path, content] of Object.entries(globMap)) {
    const [_dots, _data, _results, siteHash, filename] = path.split('/');

    const runTime = filename.replace(/(^date-|\.json$)/g, '');
    const result = TestResultOrError.safeParse(content);
    if (result.success) {
      if (!('error' in result.data)) {
        if (!results[siteHash]) results[siteHash] = {};
        results[siteHash][runTime] = content;
      }
    } else if ('error' in result) {
      const runMonth = new Date(Number(runTime)).toLocaleDateString('en', {
        month: 'long',
      });
      console.error('Excluding bad', runMonth, 'data for', content.url, 'on');
    } else {
      console.error('Something unknown went wrong', result);
    }
  }
  return Object.values(results);
}

/** Remove sites for which we don’t have good data for the most recent run. */
function excludeOldRuns(siteGroups: { [date: string]: TestData }[]) {
  const mostRecentRun = Math.max(
    ...Object.values(siteGroups).flatMap(Object.keys).map(Number)
  );
  for (const key in siteGroups) {
    const site = siteGroups[key];
    const newestDate = Number(Object.keys(site).sort().pop()!);
    const dayMs = 24 * 60 * 60 * 1000;
    if (newestDate < mostRecentRun - dayMs) {
      console.log(
        'Excluding',
        site[newestDate].url,
        '— no data for most recent run'
      );
      delete siteGroups[key];
    }
  }
  return siteGroups;
}

/**
 * Sort an array of test run data.
 * @param arr Array of site test run data collections.
 * @returns Array sorted by cumulative score of the most recent run.
 */
function sortCumulativeScore(
  arr: { [date: string]: TestData }[]
): { [date: string]: TestData }[] {
  return arr.sort((a, b) => {
    let newestKeyA = Object.keys(a).sort().pop()!;
    let newestKeyB = Object.keys(b).sort().pop()!;

    // Lighthouse error
    // e.g. { url: 'https://mangoweb.net/', error: 'Unknown error.' }
    // Commented out because we’re ignoring errors for now.
    // if (b[newestKeyB].error && a[newestKeyA].error) {
    //   return 0;
    // } else if (b[newestKeyB].error) {
    //   return -1;
    // } else if (a[newestKeyA].error) {
    //   return 1;
    // }

    // lower is better
    return a[newestKeyA].ranks.cumulative - b[newestKeyB].ranks.cumulative;
  });
}

/** Get all results data, grouped and sorted. */
export const loadResults = () =>
  sortCumulativeScore(
    excludeOldRuns(
      groupSites(import.meta.glob('../data/results/**/*.json', { eager: true }))
    )
  );
