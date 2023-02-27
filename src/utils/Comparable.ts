export interface Comparable {
  equals(b: this): boolean;
}

export function compare<A extends B, B>(a: A, b: B): b is A;
export function compare<A, B extends A>(a: A, b: B): a is B;

export function compare(a: unknown, b: unknown): boolean {
  //@ts-expect-error
  if (Object.is(a, b) || (typeof a.equals === "function" && a.equals(b)) || (typeof b.equals === "function" && b.equals(a))) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    const { length } = a;
    for (let i = 0; i < length; i++) {
      if (!compare(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
}
