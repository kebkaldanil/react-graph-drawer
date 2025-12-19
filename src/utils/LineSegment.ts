import { Direction, horisontalOnly, verticalOnly } from "./Direction";
import type { Like, Tuple } from "kamikoto00lib";
import { Vector2, type Vector2Like } from "./Vector2";
import { ZeroAngleRect, type ZeroAngleRectLike } from "./ZeroAngleRect";

export type LineSegmentLike = Like<LineSegment> | [Vector2Like, Vector2Like];

export class LineSegment {
  protected constructor(readonly p1: Vector2, readonly p2: Vector2) {}

  static of(p1: Vector2Like, p2: Vector2Like): LineSegment {
    return new LineSegment(Vector2.from(p1), Vector2.from(p2));
  }

  static from(src: LineSegmentLike) {
    if (src instanceof LineSegment) {
      return src;
    }
    if (Array.isArray(src)) {
      return LineSegment.of(Vector2.from(src[0]), Vector2.from(src[1]));
    } else {
      return LineSegment.of(Vector2.from(src.p1), Vector2.from(src.p2));
    }
  }

  fitIn(obj: ZeroAngleRectLike) {
    const rect = ZeroAngleRect.from(obj);
    let { p1, p2 } = this;
    const p1d = rect.getPointDirection(p1, true);
    const p2d = rect.getPointDirection(p2, true);
    if (p1d === Direction.inside && p2d === Direction.inside) {
      return this;
    }
    const diff = p2.minus(p1);
    if (p1d !== Direction.inside) {
      const horisontal = horisontalOnly(p1d);
      const vertical = verticalOnly(p1d);
      let p1n: Vector2 | null = null;
      if (horisontal !== Direction.inside) {
        const tdif = diff.scaleToX(
          p2.x - rect[horisontal === Direction.left ? "left" : "right"],
        );
        p1n = p2.minus(tdif);
        if (!rect.testOnSide(p1n)) {
          p1n = null;
        }
      }
      if (p1n === null && vertical !== Direction.inside) {
        const tdif = diff.scaleToY(
          p2.y - rect[vertical === Direction.bottom ? "bottom" : "top"],
        );
        p1n = p2.minus(tdif);
        if (!rect.testOnSide(p1n)) {
          p1n = null;
        }
      }
      if (p1n) {
        p1 = p1n;
      } else {
        return null;
      }
    }
    if (p2d !== Direction.inside) {
      const horisontal = horisontalOnly(p2d);
      const vertical = verticalOnly(p2d);
      let p2n: Vector2 | null = null;
      if (horisontal !== Direction.inside) {
        const tdif = diff.scaleToX(
          rect[horisontal === Direction.left ? "left" : "right"] - p1.x,
        );
        p2n = p1.plus(tdif);
        if (!rect.testOnSide(p2n)) {
          p2n = null;
        }
      }
      if (p2n === null && vertical !== Direction.inside) {
        const tdif = diff.scaleToY(
          rect[vertical === Direction.bottom ? "bottom" : "top"] - p1.y,
        );
        p2n = p1.plus(tdif);
        if (!rect.testOnSide(p2n)) {
          p2n = null;
        }
      }
      if (p2n) {
        p2 = p2n;
      } else {
        return null;
      }
    }
    return LineSegment.of(p1, p2);
  }

  toArray(): Tuple<2, Vector2> {
    return [this.p1, this.p2];
  }

  *[Symbol.iterator](): Generator<Vector2, Vector2, void> {
    yield this.p1;
    return this.p2;
  }
}
