import { Dict, If, IsNotNegative } from "kamikoto00lib";

export interface Comparable {
  equals(b: this): boolean;
}

export function areEqual<const A extends B, const B>(a: A, b: B): b is A;
export function areEqual<const A, const B extends A>(a: A, b: B): a is B;

export function areEqual(a: Dict<unknown>, b: Dict<unknown>): boolean {
  if (
    Object.is(a, b) || (typeof a.equals === "function" && a.equals(b)) ||
    (typeof b.equals === "function" && b.equals(a))
  ) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    const { length } = a;
    for (let i = 0; i < length; i++) {
      if (!areEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

export function areClose<const T extends number>(
  f1: number,
  f2: number,
  precision: If<IsNotNegative<T>, T> = 1e-12 as If<IsNotNegative<T>, T>,
) {
  return Math.abs(f1 - f2) <= precision;
}
