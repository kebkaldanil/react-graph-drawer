/* eslint-disable @typescript-eslint/no-redeclare */
import React, { useLayoutEffect } from "react";
import { atSameSide, Direction } from "../utils/Direction";
import { LineSegment } from "../utils/LineSegment";
import { Vector2, Vector2Like } from "../utils/Vector2";
import { ZeroAngleRect } from "../utils/ZeroAngleRect";
import { Drawable, DrawableContext, DrawableContextColor } from "./DrawableContext";

interface DrawerData {
  focus: Vector2;
  scale: Vector2;
  deltaTime: number;
}

declare interface DrawerContext {
  addDrawable(callback: DrawableCallback, priority?: number): Drawable;
  useDrawable(callback: DrawableCallback, priority?: number): void;
  update(data: DrawerData): DrawableContext;
  canvasRenderingContext2D?: CanvasRenderingContext2D;
  drawableContext?: DrawableContext;
  setScale(value: Vector2Like | number): boolean;
  setFocus(value: Vector2Like): boolean;
  getScale(): Vector2;
  getFocus(): Vector2;
  //clearQueue(): void;
}

const DrawerContext = React.createContext<DrawerContext>({
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
  getScale() {
    throw new Error("Context not found");
  },
  getFocus() {
    throw new Error("Context not found");
  },
});

export type DrawableCallback = (ctx: DrawableContext, deltaTime: number) => void;

export interface InitContextProps {
  canvasRenderingContext2D: CanvasRenderingContext2D;
  getScale(): Vector2;
  getFocus(): Vector2;
  setScale(value: Vector2Like | number): boolean;
  setFocus(value: Vector2Like): boolean;
}

interface DrawableObject {
  callback: DrawableCallback;
  priority: number;
};

export function initContext(props: InitContextProps): DrawerContext {
  const {
    canvasRenderingContext2D: ctx,
    ...rest
  } = props;
  const canvas = ctx.canvas;
  const canvasSize = Vector2.of(canvas.width, canvas.height);
  const minSide = Math.min(canvas.width, canvas.height);
  const canvasFactor = Vector2.of(minSide, -minSide);

  let callbackQueue: DrawableObject[] = [];
  const drawerContext: DrawerContext = {
    update,
    useDrawable,
    addDrawable,
    canvasRenderingContext2D: ctx,
    ...rest
  };

  return drawerContext;

  function update(data: DrawerData): DrawableContext {
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
    const drawableContext: DrawableContext = {
      scale,
      focus,
      cordInPixel,
      drawingZone,
      canvasSize,
      clear,
      drawLine,
      printText,
      setColor,
      absoluteCordsToPixel,
      pixelCordsToAbsolute,
      drawerContext,
    };
    
    drawerContext.drawableContext = drawableContext;
    clear();
    callbackQueue.forEach(({ callback }) => {
      callback(drawableContext, deltaTime);
    });
    return drawableContext;

    function clear() {
      ctx.clearRect(0, 0, canvasSize.x, canvasSize.y);
      return drawableContext;
    }

    function setColor(style: DrawableContextColor) {
      if (Array.isArray(style)) {
        if (style.length === 3) {
          style = `rgb(${style.join()})`;
        } else if (style.length === 4) {
          style = `rgba(${style.join()})`;
        }
      }
      ctx.strokeStyle = ctx.fillStyle = style;
      return drawableContext;
    }

    /*function pointsBetween(p1: Vector2, p2: Vector2) {
      const diff = p2.minus(p1);
      const cord = Math.abs(diff.x) > Math.abs(diff.y) ? "x" : "y";
      const cordDiff = Math.abs(diff[cord]);
      const deltaCord = Math.abs(cordInPixel[cord]);
      let deltaScale = 0;
      deltaScale += deltaCord;
      while (deltaScale < cordDiff) { }
    }*/

    function absoluteCordsToPixel<T extends Vector2 | Vector2[]>(value: T): T {
      if (Array.isArray(value)) {
        return value.map(absoluteCordsToPixel) as T;
      }
      return value.minus(drawableCorner).divide(cordInPixel).round() as T;
    }
    
    function pixelCordsToAbsolute<T extends Vector2 | Vector2[]>(value: T): T {
      if (Array.isArray(value)) {
        return value.map(pixelCordsToAbsolute) as T;
      }
      return value.scale(cordInPixel).plus(drawableCorner) as T;
    }

    function drawLine(...points: Vector2[]): DrawableContext {
      if (!points.length) {
        console.warn("Nothing to draw!");
        return drawableContext;
      }

      if (points.length === 1) {
        const { x, y } = absoluteCordsToPixel(points[0]);
        ctx.fillRect(x, y, 1, 1);
        console.log("fillRect");

      } else {
        const moveTo = (point: Vector2) => {
          const { x, y } = absoluteCordsToPixel(point);
          ctx.moveTo(x, y);
        };
        const lineTo = (point: Vector2) => {
          const { x, y } = absoluteCordsToPixel(point);
          ctx.lineTo(x, y);
        };

        let lastPoint: Vector2 | null = points[0];
        ctx.beginPath();
        moveTo(lastPoint);
        for (let i = 1; i < points.length; i++) {
          let point = points[i];
          if (point.hasNaN()) {
            lastPoint = null;
            continue;
          }
          const pointDir = drawingZone.getPointDirection(point);
          if (lastPoint) {
            const lastPointDir = drawingZone.getPointDirection(lastPoint);
            if (atSameSide(pointDir, lastPointDir)) {
              if (lastPointDir === Direction.inside) {
                lineTo(point);
              }
            } else {
              const normal = LineSegment.from([lastPoint, point]);//.fitIn(drawingZone);
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
      }
      return drawableContext;
    }

    interface PrintTextOptions {
      horizontalAlign?: CanvasTextAlign;
      verticalAlign?: CanvasTextBaseline;
    }

    function printText(text: string, point: Vector2, options: PrintTextOptions = {}) {
      const {
        horizontalAlign = "center",
        verticalAlign = "middle",
      } = options;
      const { x, y } = absoluteCordsToPixel(point);
      ctx.textAlign = horizontalAlign;
      ctx.textBaseline = verticalAlign;
      ctx.fillText(text, x, y);
      return drawableContext;
    }
  }

  function addDrawable(callback: DrawableCallback, priority = 100) {
    const drawableObject = { callback, priority };
      let index = 0;
      while (callbackQueue[index]?.priority < priority && index < callbackQueue.length) {
        index++;
      }
      callbackQueue.splice(index, 0, drawableObject);
      return {
        remove: () => {
          const index = callbackQueue.indexOf(drawableObject);
          if (index >= 0) {
            callbackQueue.splice(index, 1);
          }
        }
      };
  }

  function useDrawable(callback: DrawableCallback, priority = 100) {
    useLayoutEffect(() => {
      return addDrawable(callback, priority).remove;
    });
  }
}

export default DrawerContext;
