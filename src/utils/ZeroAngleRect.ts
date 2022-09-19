import { Like } from "kamikoto00lib";
import { Direction } from "./Direction";
import { Vector2, Vector2Like } from "./Vector2";

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
    Object.freeze(this);
  }

  static from(src: ZeroAngleRectLike | [number, number, number, number]) {
    if (src instanceof ZeroAngleRect) {
      return src;
    }
    if (Array.isArray(src)) {
      return new ZeroAngleRect(...src);
    }
    return new ZeroAngleRect(src.left, src.right, src.top, src.bottom);
  }

  static byPoints(p1: Vector2Like, p2: Vector2Like) {
    p1 = Vector2.like(p1);
    p2 = Vector2.like(p2);
    return new ZeroAngleRect(p1.x, p2.x, p1.y, p2.y);
  }

  testInside(point: Vector2Like) {
    point = Vector2.like(point);
    const { x, y } = point;
    const { left, right, top, bottom } = this;
    return x > left && x < right && y > bottom && y < top;
  }

  getPointDirection(point: Vector2Like) {
    point = Vector2.like(point);
    let direction = Direction.inside;
    const { x, y } = point;
    if (x < this.left) {
      direction |= Direction.left;
    } else if (x > this.right) {
      direction |= Direction.right;
    }
    if (y < this.bottom) {
      direction |= Direction.bottom;
    } else if (y > this.top) {
      direction |= Direction.top;
    }
    return direction;
  }

  toString() {
    return `(${this.left}-${this.right};${this.bottom}-${this.top})`;
  }
}
