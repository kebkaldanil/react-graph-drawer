import { compare } from "./Comparable";

export const memoizeFunction = <A extends unknown[], R>(f: (...args: A) => R): (...args: A) => R => {
  const memoKey: A[] = [];
  const memoValue: R[] = [];
  return (...args) => {
    const index = memoKey.findIndex((key) => compare(key, args));
    if (index === -1) {
      const r = f(...args);
      memoKey[memoKey.length] = args;
      return memoValue[memoValue.length] = r;
    }
    return memoValue[index];
  };
};

export const memoizeUintArgFunction = (f: (x: number) => number) => {
  let memoArray = new Float64Array(10);
  let memoLength = 0;
  return (x: number) => {
    const i = Math.ceil(x);
    if (memoLength <= i) {
      let memoArrayLength = memoArray.length;
      while (memoArrayLength <= i) {
        memoArrayLength = memoArrayLength << 1;
      }
      if (memoArrayLength !== memoArray.length) {
        const newMemoArray = new Float64Array(memoArrayLength);
        for (let i = 0; i < memoLength; i++) {
          newMemoArray[i] = memoArray[i];
        }
        memoArray = newMemoArray;
      }
      while (memoLength <= i) {
        memoArray[memoLength] = f(memoLength);
        memoLength++;
      }
    }
    if (Number.isSafeInteger(x)) {
      return memoArray[x];
    }
    const k = x - Math.floor(x);
    return memoArray[i - 1] * (1 - k) + memoArray[i] * k;
  };
};
