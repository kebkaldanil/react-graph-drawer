export const makeArray = <T>(
  length: number,
  func: (i: number, arr: T[]) => T,
) => {
  const arr: T[] = new Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = func(i, arr);
  }
  return arr;
};

export const alwaysArray = <T>(x: T): T extends unknown[] ? T : [T] =>
  (Array.isArray(x) ? x : [x]) as T extends unknown[] ? T : [T];
