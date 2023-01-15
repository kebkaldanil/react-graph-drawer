import { ceil, floor, Like, round, clamp, Tuple } from "kamikoto00lib";
import { useRef } from "react";

export type Vector2Like = Like<Vector2> | [number, number];

export class Vector2 implements Iterable<number> {
  readonly x: number;
  readonly y: number;

  protected constructor(x: number | `${number}`, y: number | `${number}`) {
    this.x = +x;
    this.y = +y;
  }

  static of(x: number | `${number}`, y: number | `${number}`): Vector2 {
    return Object.freeze(new Vector2(x, y));
  }

  static from(src: Vector2Like | number | `${number}`) {
    if (src instanceof Vector2) {
      return src;
    }
    if (Array.isArray(src)) {
      return Vector2.of(...src);
    }
    if (typeof src === "number" || typeof src === "string") {
      return Vector2.of(src, src);
    }
    return Vector2.of(src.x, src.y);
  }

  static like<T extends Vector2Like = Like<Vector2>>(src: T): T extends Like<Vector2> ? T : Vector2 {
    if (Array.isArray(src)) {
      return Vector2.of(...src as Tuple<2, number>) as any;// { x: +src[0], y: +src[1] } as any;
    }
    if (typeof src.x === "number" && typeof src.y === "number") {
      return src as any;
    }
    return Vector2.of(src.x, src.y) as any;
  }

  static equals(a: Vector2Like, b: Vector2Like) {
    if (a === b) {
      if (a === Vector2.NaV) {
        return false;
      }
      if (Array.isArray(a)) {
        return !(Number.isNaN(a[0]) || Number.isNaN(a[1]));
      }
      return !(Number.isNaN(a.x) || Number.isNaN(a.y));
    }
    a = Vector2.like(a);
    b = Vector2.like(b);
    // eslint-disable-next-line eqeqeq
    return a.x == b.x && a.y == b.y;
  }

  static is(a: Vector2Like, b: Vector2Like) {
    if (Object.is(a, b)) {
      return true;
    }
    a = Vector2.like(a);
    b = Vector2.like(b);
    return Object.is(a.x, b.x) && Object.is(a.y, b.y);
  }

  static readonly ZERO = Vector2.of(0, 0);
  static readonly UP = Vector2.of(0, 1);
  static readonly BOTTOM = Vector2.of(0, -1);
  static readonly LEFT = Vector2.of(-1, 0);
  static readonly RIGTH = Vector2.of(1, 0);
  static readonly NaV = Vector2.of(NaN, NaN);

  static exp(vec: Vector2Like) {
    const { x, y } = Vector2.like(vec);
    return Vector2.of(Math.exp(+x), Math.exp(+y));
  }

  static log(vec: Vector2Like, n?: number) {
    const { x, y } = Vector2.like(vec);
    const nLog = n ? Math.log(n) : 1;
    return Vector2.of(Math.log(+x) / nLog, Math.log(+y) / nLog);
  }

  static pow<T extends Vector2Like | number>(a: T, b: T extends number ? Vector2Like : number) {
    if (typeof a === "number") {
      const { x, y } = Vector2.like(b as Vector2Like);
      return Vector2.of(a ** +x, a ** +y);
    } else {
      const { x, y } = Vector2.like(a);
      return Vector2.of((+x) ** (b as number), (+y) ** (b as number));
    }
  }

  static abs(vec: Vector2Like) {
    vec = Vector2.like(vec);
    if (vec.x >= 0 && vec.y >= 0) {
      return Vector2.from(vec);
    }
    return Vector2.of(Math.abs(+vec.x), Math.abs(+vec.y));
  }

  equals(val: Vector2Like) {
    return Vector2.equals(this, val);
  }

  is(val: Vector2Like) {
    return Vector2.is(this, val);
  }

  plus(vec: Vector2Like) {
    vec = Vector2.like(vec);
    return Vector2.of(+this.x + +vec.x, +this.y + +vec.y);
  }

  minus(vec: Vector2Like) {
    vec = Vector2.like(vec);
    return Vector2.of(this.x - vec.x, this.y - vec.y);
  }

  multiply<T extends Vector2Like | number = Vector2Like>(val: T): T extends Vector2Like ? number : Vector2 {
    if (typeof val === "number") {
      return Vector2.of(this.x * val, this.y * val) as T extends Vector2Like ? number : Vector2;
    }
    const _val = Vector2.like(val);
    return this.x * _val.y + this.y * _val.x as T extends Vector2Like ? number : Vector2;
  }

  scale(factor: number | Vector2Like) {
    const { x, y } = typeof factor === "object" ? Vector2.like(factor) : { x: factor, y: factor };
    return Vector2.of(this.x * x, this.y * y);
  }

  divide(factor: number | Vector2Like) {
    const { x, y } = typeof factor === "object" ? Vector2.like(factor) : { x: factor, y: factor };
    return Vector2.of(this.x / x, this.y / y);
  }

  round(to: number | Vector2Like = 1) {
    const { x, y } = typeof to === "number" ? { x: to, y: to } : Vector2.like(to);
    return Vector2.of(round(this.x, +x), round(this.y, +y));
  }

  floor(to: number | Vector2Like = 1) {
    const { x, y } = typeof to === "number" ? { x: to, y: to } : Vector2.like(to);
    return Vector2.of(floor(this.x, +x), floor(this.y, +y));
  }

  ceil(to: number | Vector2Like = 1) {
    const { x, y } = typeof to === "number" ? { x: to, y: to } : Vector2.like(to);
    return Vector2.of(ceil(this.x, +x), ceil(this.y, +y));
  }

  normalize(min = 0) {
    const length = this.length();
    return length < min ? Vector2.ZERO : this.divide(this.length());
  }

  lengthSqr() {
    return this.x ** 2 + this.y ** 2;
  }

  length<T extends number | void | null = void>(newLength?: T): T extends number ? Vector2 : number {
    const length = Math.hypot(this.x, this.y);
    return (newLength == null ? length : this.scale(+newLength / length)) as T extends number ? Vector2 : number;
  }

  maxLength(maxLength: number) {
    const length = this.length();
    return length > maxLength ? this.scale(maxLength / length) : this;
  }

  inverse() {
    return Vector2.of(-this.x, -this.y);
  }

  inverseX() {
    return Vector2.of(-this.x, this.y);
  }

  inverseY() {
    return Vector2.of(this.x, -this.y);
  }

  hasNaN() {
    return this === Vector2.NaV || Number.isNaN(this.x) || Number.isNaN(this.y);
  }

  scaleToX(x: number) {
    if (Object.is(x, this.x)) {
      return this;
    }
    return Vector2.of(x, this.y * x / this.x);
  }

  scaleToY(y: number) {
    if (Object.is(y, this.y)) {
      return this;
    }
    return Vector2.of(this.x * y / this.y, y);
  }

  moveTo(target: Vector2Like, delta: number) {
    const targetVec = Vector2.from(target);
    const _delta = targetVec.minus(this);
    const deltaLen = _delta.length();
    return deltaLen <= delta ? targetVec : this.plus(_delta.scale(delta / deltaLen));
  }

  clamp(min: Vector2Like, max: Vector2Like) {
    min = Vector2.like(min);
    max = Vector2.like(max);
    return Vector2.of(clamp(+min.x, this.x, +max.x), clamp(+min.y, this.y, +max.y));
  }

  abs() {
    return Vector2.abs(this);
  }

  valueOf() {
    return this === Vector2.ZERO ? 0 : this.length();
  }

  toString() {
    return `(${this.x}; ${this.y})`;
  }

  toArray() {
    return [this.x, this.y];
  }

  *[Symbol.iterator](): Generator<number, number, void> {
    yield this.x;
    return this.y;
  }

  [0]() {
    return this.x;
  }

  [1]() {
    return this.y;
  }
}

export const useVector2 = (value: Vector2Like | number | `${number}`) => {
  const ref = useRef(Vector2.ZERO);
  if (typeof value === "number" || typeof value === "string") {
    value = Vector2.of(value, value);
  }
  if (ref.current.is(value)) {
    return ref.current;
  }
  return ref.current = Vector2.from(value);
}
