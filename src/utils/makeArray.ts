export const makeArray = <T>(length: number, func: (i: number, arr: T[]) => T) => {
  const arr: T[] = new Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = func(i, arr);
  }
  return arr;
};
