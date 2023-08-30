import { useCallback, useContext } from "react";
import { Vector2 } from "../utils/Vector2";
import { BaseDrawableProps } from "./Drawable";
import { DrawableContext, DrawableContextColor } from "./Drawable";
import DrawerContext, { defaultPriority } from "./DrawerContext";
import { alwaysArray } from "../utils/makeArray";
import { moveNumberClosestToTargetByStep, NumberProp } from "../utils/number";

export type SimpleFunction = (x: number) => number;
export type MultipleResultFunction = (x: number) => number[];

export interface FunctionGraphProps extends BaseDrawableProps {
  func: SimpleFunction | MultipleResultFunction;
  color?: DrawableContextColor;
  smartStep?: NumberProp | boolean | null;
  smartStart?: NumberProp;
}

function FunctionGraph(props: FunctionGraphProps) {
  const { useDrawable } = useContext(DrawerContext);
  const {
    func,
    color = "black",
    priority = defaultPriority,
    smartStep: smartStepProp,
    smartStart = 0,
  } = props;
  const smartStep = +smartStepProp!;
  const drawableCB = useCallback((ctx: DrawableContext) => {
    const {
      setColor,
      drawLine,
      canvasSize,
      cordInPixel: realScale,
      drawingZone,
    } = ctx;
    setColor(color);
    const points: Vector2[][] = [[]];
    let nextSmart = smartStep && drawingZone.size().x / smartStep < 10000
      ? moveNumberClosestToTargetByStep(
        smartStep,
        drawingZone.left,
        +smartStart,
      )
      : NaN;
    let xp = 0;
    while (xp <= canvasSize.x) {
      const curx = xp * realScale.x + drawingZone.left;
      const x = nextSmart < curx ? nextSmart : curx;
      if (curx === x) {
        xp++;
      }
      //after this check we are sure smartStep is not null (cause nextSmart is not NaN)
      if (nextSmart === x) {
        nextSmart += smartStep!;
      }
      const ys = alwaysArray(func(x));
      while (points.length < ys.length) {
        points.push([]);
      }
      for (let i = 0; i < points.length; i++) {
        const curPoints = points[i];
        if (i >= ys.length) {
          if (!curPoints.at(-1)!.hasNaN()) {
            curPoints.push(Vector2.NaV);
          }
          break;
        } else {
          const y = ys[i];
          curPoints.push(Vector2.of(x, y));
        }
      }
    }
    for (let i = 0; i < points.length; i++) {
      drawLine(points[i]);
    }
  }, [color, func, smartStart, smartStep]);
  useDrawable(drawableCB, +priority);
  return null;
}

export default FunctionGraph;
