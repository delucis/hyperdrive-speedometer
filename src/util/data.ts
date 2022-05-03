interface TestData {
  timestamp: number;
  error?;
  url: string;
  requestedUrl?: string;
  ranks: {
    hundos: number;
    performance: number;
    accessibility: number;
    cumulative: number;
  };
  lighthouse: {
    version: string;
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    total: number;
  };
  firstContentfulPaint: number;
  firstMeaningfulPaint: number;
  speedIndex: number;
  largestContentfulPaint: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  maxPotentialFirstInputDelay: number;
  timeToFirstByte: number;
  weight: {
    summary: string;
    total: number;
    image: number;
    imageCount: number;
    script: number;
    scriptCount: number;
    document: number;
    font: number;
    fontCount: number;
    stylesheet: number;
    stylesheetCount: number;
    thirdParty: number;
    thirdPartyCount: number;
  };
  run: {
    number: number;
    total: number;
  };
  axe: {
    passes: number;
    violations: number;
  };
};

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
    if (!results[siteHash]) results[siteHash] = {};
    results[siteHash][filename.replace(/(^date-|\.json$)/g, '')] = content;
  }
  return Object.values(results);
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
    let newestKeyA = Object.keys(a).sort().pop();
    let newestKeyB = Object.keys(b).sort().pop();

    // Lighthouse error
    // e.g. { url: 'https://mangoweb.net/', error: 'Unknown error.' }
    if (b[newestKeyB].error && a[newestKeyA].error) {
      return 0;
    } else if (b[newestKeyB].error) {
      return -1;
    } else if (a[newestKeyA].error) {
      return 1;
    }

    // lower is better
    return a[newestKeyA].ranks.cumulative - b[newestKeyB].ranks.cumulative;
  });
}

/** Get all results data, grouped and sorted. */
export const loadResults = async () =>
  sortCumulativeScore(
    groupSites(await import.meta.globEager('../data/results/**/*.json'))
  );
