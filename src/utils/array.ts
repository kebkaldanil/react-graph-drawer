export const alwaysArray = <T>(x: T) =>
  (Array.isArray(x) ? x : [x]) as T extends any[] ? T : [T];
