import React, { useLayoutEffect } from "react";
import { atSameSide, Direction } from "../utils/Direction";
import { LineSegment } from "../utils/LineSegment";
import { Vector2, type Vector2Like } from "../utils/Vector2";
import { ZeroAngleRect } from "../utils/ZeroAngleRect";
import type {
  Drawable,
  DrawableContext,
  DrawableContextColor,
  PrintTextOptions,
} from "./Drawable";
import type { primitive } from "kamikoto00lib";
import type { NumberProp } from "../utils/number";

interface DrawerData {
  focus: Vector2;
  scale: Vector2;
  deltaTime: number;
}

declare interface DrawerContext {
  addDrawable(
    callback: DrawableCallback,
    priority?: NumberProp,
  ): Readonly<Drawable>;
  useDrawable(callback: DrawableCallback, priority?: NumberProp): void;
  update(data: DrawerData): Readonly<DrawableCallback>;
  canvasRenderingContext2D?: CanvasRenderingContext2D;
  drawableContext?: DrawableContext;
  setScale(value: Readonly<Vector2Like> | number): boolean;
  setFocus(value: Readonly<Vector2Like>): boolean;
  setSize(value: Readonly<Vector2Like>): boolean;
  getScale(): Vector2;
  getFocus(): Vector2;
  getSize(): Vector2;
  onSizeUpdate(value: Vector2): void;
  setColor(style: DrawableContextColor): void;
}

export const defaultPriority = 100;

const DrawerContext = React.createContext<DrawerContext>(Object.freeze({
  addDrawable() {
    console.warn("Drawer context not found");
    return {
      remove: () => {},
    };
  },
  useDrawable() {
    console.warn("Drawer context not found");
  },
  update() {
    throw new Error("Context not found");
  },
  setFocus() {
    throw new Error("Context not found");
  },
  setScale() {
    throw new Error("Context not found");
  },
  setSize() {
    throw new Error("Context not found");
  },
  getScale() {
    throw new Error("Context not found");
  },
  getFocus() {
    throw new Error("Context not found");
  },
  getSize() {
    throw new Error("Context not found");
  },
  onSizeUpdate() {
    throw new Error("Context not found");
  },
  setColor() {
    throw new Error("Context not found");
  },
}));

export type DrawableCallback = (
  ctx: Readonly<DrawableContext>,
  deltaTime: number,
) => void;

export interface InitContextProps {
  canvasRenderingContext2D: CanvasRenderingContext2D;
  getScale(): Vector2;
  getFocus(): Vector2;
  setScale(value: Vector2Like | number): boolean;
  setFocus(value: Vector2Like): boolean;
  getSize(): Vector2;
  setSize(value: Vector2Like): boolean;
}

interface DrawableObject {
  callback: DrawableCallback;
  priority: number;
}

export function initContext(props: InitContextProps): Readonly<DrawerContext> {
  const {
    canvasRenderingContext2D: ctx,
    ...rest
  } = props;
  let canvasSize = props.getSize();
  const minSide = Math.min(canvasSize.x, canvasSize.y);
  let canvasFactor = Vector2.of(minSide, -minSide);

  const callbackQueue: DrawableObject[] = [];
  const drawerContext: DrawerContext = {
    update,
    useDrawable,
    addDrawable,
    onSizeUpdate,
    setColor,
    canvasRenderingContext2D: ctx,
    ...rest,
  };

  return drawerContext;

  function setColor(style: DrawableContextColor) {
    if (Array.isArray(style)) {
      if (style.length === 3) {
        style = `rgb(${style.join()})`;
      } else if (style.length === 4) {
        style = `rgba(${style.join()})`;
      }
    }
    ctx.strokeStyle = ctx.fillStyle = style;
  }

  function onSizeUpdate(value: Vector2) {
    canvasSize = value;
    props.setSize(canvasSize);
    const minSide = Math.min(canvasSize.x, canvasSize.y);
    canvasFactor = Vector2.of(minSide, -minSide);
  }

  function update(data: DrawerData): Readonly<DrawableContext> {
    const {
      focus,
      scale,
      deltaTime,
    } = data;
    const cordInPixel = scale.divide(canvasFactor);
    const graphHalfSize = canvasSize.scale(cordInPixel).divide(2);
    const drawingZone = ZeroAngleRect.byPoints(
      focus.plus(graphHalfSize),
      focus.minus(graphHalfSize),
    );
    const drawableCorner = Vector2.of(drawingZone.left, drawingZone.top);
    const drawableContext: Readonly<DrawableContext> = Object.freeze({
      scale,
      focus,
      cordInPixel,
      drawingZone,
      canvasSize,
      clear,
      drawLine,
      printText,
      setColor(style: DrawableContextColor) {
        drawerContext.setColor(style);
        return this;
      },
      absoluteCordsToPixel,
      pixelCordsToAbsolute,
      drawerContext,
    });

    drawerContext.drawableContext = drawableContext;
    clear();
    callbackQueue.forEach(({ callback }) => {
      try {
        callback(drawableContext, deltaTime);
      } catch (e) {
        console.error(e);
      }
    });
    return drawableContext;

    function clear() {
      ctx.clearRect(0, 0, canvasSize.x, canvasSize.y);
      return drawableContext;
    }

    function absoluteCordsToPixel<T extends Vector2 | Vector2[]>(value: T): T {
      if (Array.isArray(value)) {
        return value.map(absoluteCordsToPixel) as T;
      }
      return value.minus(drawableCorner).divide(cordInPixel) as T;
    }

    function pixelCordsToAbsolute<T extends Vector2 | Vector2[]>(value: T): T {
      if (Array.isArray(value)) {
        return value.map(pixelCordsToAbsolute) as T;
      }
      return value.scale(cordInPixel).plus(drawableCorner) as T;
    }

    function moveTo(point: Vector2) {
      const { x, y } = absoluteCordsToPixel(point);
      ctx.moveTo(x, y);
    }
    function lineTo(point: Vector2) {
      const { x, y } = absoluteCordsToPixel(point);
      ctx.lineTo(x, y);
    }

    function drawLine(points: Iterable<Vector2Like>): DrawableContext {
      let lastPoint: Vector2 | null = null;
      ctx.beginPath();
      for (const _point of points) {
        const point = Vector2.from(_point);
        if (point.hasNaN()) {
          lastPoint = null;
          continue;
        }
        const pointDir = drawingZone.getPointDirection(point);
        if (lastPoint) {
          const lastPointDir = drawingZone.getPointDirection(lastPoint);
          if (atSameSide(pointDir, lastPointDir)) {
            if (lastPointDir === Direction.inside) {
              const seg = LineSegment.of(point, lastPoint).fitIn(drawingZone);
              if (seg) {
                lineTo(seg.p1);
              }
            }
          } else {
            const normal = LineSegment.from([lastPoint, point]).fitIn(
              drawingZone,
            );
            if (normal) {
              const { p1, p2 } = normal;
              if (lastPointDir === Direction.inside) {
                lineTo(p2);
              } else {
                moveTo(p1);
                lineTo(p2);
              }
            }
          }
        } else if (pointDir === Direction.inside) {
          moveTo(point);
        }
        lastPoint = point;
      }
      ctx.stroke();
      return drawableContext;
    }

    function printText(
      text: primitive,
      point: Vector2Like,
      options: PrintTextOptions = {},
    ) {
      const {
        horizontalAlign = "center",
        verticalAlign = "middle",
        font = "",
      } = options;
      const margin = Vector2.from(options.margin || 0);
      let { x, y } = absoluteCordsToPixel(Vector2.from(point));
      switch (horizontalAlign) {
        case "right":
        case "end":
          x -= margin.x * Math.sign(cordInPixel.x);
          break;
        default:
          x += margin.x * Math.sign(cordInPixel.x);
      }
      switch (verticalAlign) {
        case "top":
          y -= margin.y * Math.sign(cordInPixel.y);
          break;
        default:
          y += margin.y * Math.sign(cordInPixel.y);
      }
      ctx.textAlign = horizontalAlign;
      ctx.textBaseline = verticalAlign;
      ctx.font = font;
      ctx.fillText("" + text, x, y);
      return drawableContext;
    }
  }

  function addDrawable(
    callback: DrawableCallback,
    priority: NumberProp = defaultPriority,
  ) {
    priority = +priority;
    const drawableObject = { callback, priority };
    let index = 0;
    while (
      callbackQueue[index]?.priority < priority && index < callbackQueue.length
    ) {
      index++;
    }
    callbackQueue.splice(index, 0, drawableObject);
    const focus = rest.getFocus();
    rest.setFocus(Vector2.NaV);
    rest.setFocus(focus);
    return {
      remove: () => {
        const focus = rest.getFocus();
        rest.setFocus(Vector2.NaV);
        rest.setFocus(focus);
        const index = callbackQueue.indexOf(drawableObject);
        if (index >= 0) {
          callbackQueue.splice(index, 1);
        }
      },
    };
  }

  function useDrawable(
    callback: DrawableCallback,
    _priority: NumberProp = defaultPriority,
  ) {
    const priority = +_priority;
    useLayoutEffect(() => {
      return addDrawable(callback, priority).remove;
    }, [callback, priority]);
  }
}

export default DrawerContext;
