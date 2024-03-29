const resetEscape = '\x1b[0m';
const dimEscape = '\x1b[2m';
const boldEscape = '\x1b[1m';
const underlineEscape = '\x1b[4m';
const redEscape = '\x1b[31m';
const blueEscape = '\x1b[34m';
export const dim = (s: string) => dimEscape + s + resetEscape;
export const heading = (s: string) => boldEscape + underlineEscape + s + resetEscape;
export const red = (s: string) => redEscape + s + resetEscape;
export const blue = (s: string) => blueEscape + s + resetEscape;
export const bold = (s: string) => boldEscape + s + resetEscape;
