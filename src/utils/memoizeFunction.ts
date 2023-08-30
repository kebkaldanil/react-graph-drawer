import { uint } from "kamikoto00lib";
import { areEqual } from "./Comparable";

export const memoizeFunction = <A extends unknown[], R>(
  f: (...args: A) => R,
): (...args: A) => R => {
  const memoKey: A[] = [];
  const memoValue: R[] = [];
  return (...args) => {
    const index = memoKey.findIndex((key) => areEqual(key, args));
    if (index === -1) {
      const r = f(...args);
      memoKey[memoKey.length] = args;
      return memoValue[memoValue.length] = r;
    }
    return memoValue[index];
  };
};

export const memoizeUintArgFunction = <const T extends number = 1>(
  f: (x: number) => number,
  step: uint<T> = 1 as uint<T>,
) => {
  let memoArray = new Float64Array(10);
  let memoLength = 0;
  return (x: number) => {
    if (x < 0) {
      return NaN;
    }
    x /= step;
    const i = Math.ceil(x);
    if (memoLength <= i) {
      let memoArrayLength = memoArray.length;
      while (memoArrayLength <= i) {
        memoArrayLength = memoArrayLength << 1;
      }
      if (memoArrayLength !== memoArray.length) {
        const newMemoArray = new Float64Array(memoArrayLength);
        newMemoArray.set(memoArray);
        memoArray = newMemoArray;
      }
      while (memoLength <= i) {
        memoArray[memoLength] = f(memoLength * step);
        memoLength++;
      }
      console.log(memoArray);
    }
    if (x === i) {
      return memoArray[x];
    }
    const k = x % 1;
    return memoArray[i - 1] * (1 - k) + memoArray[i] * k;
  };
};
