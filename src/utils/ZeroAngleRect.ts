import type { If, IsNotNegative, Like } from "kamikoto00lib";
import { Direction } from "./Direction";
import { Vector2, type Vector2Like } from "./Vector2";
import { areClose } from "./Comparable";

export type ZeroAngleRectLike = Like<ZeroAngleRect>;

export class ZeroAngleRect implements ZeroAngleRectLike {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;

  constructor(left: number, right: number, top: number, bottom: number) {
    left = +left;
    right = +right;
    top = +top;
    bottom = +bottom;
    if (left > right) {
      [left, right] = [right, left];
    }
    if (bottom > top) {
      [top, bottom] = [bottom, top];
    }
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  static from(src: ZeroAngleRectLike | [number, number, number, number]) {
    if (src instanceof ZeroAngleRect) {
      return src;
    }
    if (Array.isArray(src)) {
      return new ZeroAngleRect(...src);
    }
    return new ZeroAngleRect(+src.left, +src.right, +src.top, +src.bottom);
  }

  static byPoints(p1: Vector2Like, p2: Vector2Like) {
    p1 = Vector2.like(p1);
    p2 = Vector2.like(p2);
    return new ZeroAngleRect(+p1.x, +p2.x, +p1.y, +p2.y);
  }

  testInside(point: Vector2Like) {
    point = Vector2.like(point);
    const { x, y } = point;
    const { left, right, top, bottom } = this;
    return x > left && x < right && y > bottom && y < top;
  }

  testOutside(point: Vector2Like) {
    point = Vector2.like(point);
    const { x, y } = point;
    const { left, right, top, bottom } = this;
    return x < left || x > right || y < bottom || y > top;
  }

  testOnSide<const T extends number>(
    point: Vector2Like,
    precision: If<IsNotNegative<T>, T> = 1e-12 as If<IsNotNegative<T>, T>,
  ) {
    const { x, y } = Vector2.like(point);
    const { left, right, top, bottom } = this;
    if (precision === 0) {
      return ((x === left || x === right) && y >= bottom && y <= top) ||
        ((y === top || y === bottom) && x >= left && x <= right);
    }
    const xClose = areClose(x, left, precision) ||
      areClose(x, right, precision);
    if (xClose && y >= bottom && y <= top) {
      return true;
    }
    const yClose = areClose(y, bottom, precision) ||
      areClose(y, top, precision);
    return yClose && ((x >= left && x <= right) || xClose);
  }

  testOnCorner<const T extends number>(
    point: Vector2Like,
    precision: If<IsNotNegative<T>, T> = 1e-12 as If<IsNotNegative<T>, T>,
  ) {
    const { x, y } = Vector2.like(point);
    const { left, right, top, bottom } = this;
    if (precision) {
      return (areClose(x, left, precision) || areClose(x, right, precision)) &&
        (areClose(y, top, precision) || areClose(y, bottom, precision));
    }
    return (x === left || x === right) && (y === top || y === bottom);
  }

  getPointDirection(point: Vector2Like, sideIsInside = false) {
    point = Vector2.like(point);
    let direction = Direction.inside;
    const { x, y } = point;
    if (sideIsInside ? x <= this.left : x < this.left) {
      direction |= Direction.left;
    } else if (sideIsInside ? x >= this.right : x > this.right) {
      direction |= Direction.right;
    }
    if (sideIsInside ? y <= this.bottom : y < this.bottom) {
      direction |= Direction.bottom;
    } else if (sideIsInside ? y >= this.top : y > this.top) {
      direction |= Direction.top;
    }
    return direction;
  }

  size() {
    return Vector2.of(this.right - this.left, this.top - this.bottom);
  }

  toString() {
    return `(${this.left}-${this.right};${this.bottom}-${this.top})`;
  }
}
