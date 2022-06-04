type Size = 'opengraph' | 'small' | 'medium' | 'large';

const buildTime = Date.now();

export const screenshotUrl = (
  url: string,
  size: Size = 'opengraph',
  tall = false
) =>
  `https://v1.screenshot.11ty.dev/${encodeURIComponent(url)}/${size}/${
    tall ? '9:16' : '1:1'
  }/_${buildTime}/`;
