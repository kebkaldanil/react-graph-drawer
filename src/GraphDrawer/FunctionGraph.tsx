import { round } from "kamikoto00lib";
import { useCallback, useContext } from "react";
import { Vector2 } from "../utils/Vector2";
import { BaseDrawableProps } from "./Drawable";
import { DrawableContext, DrawableContextColor, ComputedProp } from "./Drawable";
import DrawerContext, { defaultPriority } from "./DrawerContext";

export type SimpleFunction = (x: number) => number;
export type MultipleResultFunction = (x: number) => number[];

export interface FunctionGraphProps extends BaseDrawableProps {
  function: SimpleFunction | MultipleResultFunction;
  color?: DrawableContextColor;
  roundX?: boolean | number | `${number}` | ComputedProp;
}

const defaultRoundX = (ctx: DrawableContext) => {
  const log10 = Math.floor(Math.log10(ctx.scale.x / ctx.canvasSize.x));
  const res = Math.pow(10, log10);
  return res;
};

function FunctionGraph(props: FunctionGraphProps) {
  const { useDrawable } = useContext(DrawerContext);
  const {
    function: func,
    color = "black",
    priority = defaultPriority,
    roundX: roundX_prop = false,
  } = props;
  const roundXSrc = roundX_prop === true ? defaultRoundX : typeof roundX_prop === "function" ? roundX_prop : +roundX_prop;
  const drawableCB = useCallback((ctx: DrawableContext) => {
    const { setColor, drawLine, canvasSize, cordInPixel: realScale, drawingZone } = ctx;
    setColor(color);
    const roundX = typeof roundXSrc === "function" ? roundXSrc(ctx) : roundXSrc;
    const points: Vector2[][] = [[]];
    for (let xp = 0; xp < canvasSize.x; xp++) {
      const x = xp * realScale.x + drawingZone.left;
      const y = func(roundX ? round(x, roundX) : x);
      const ys = Array.isArray(y) ? y : [y];
      while (points.length < ys.length) {
        points.push([]);
      }
      for (let i = 0; i < points.length; i++) {
        const curPoints = points[i];
        const y = ys[i];
        if (i >= ys.length) {
          if (Number.isNaN(curPoints.at(-1))) {
            break;
          }
          curPoints.push(Vector2.NaV);
        } else {
          curPoints.push(Vector2.of(x, y));
        }
      }
      //if (y >= drawingZone.bottom && y <= drawingZone.top) {
      //} else if (!points[points.length - 1]?.hasNaN()) {
        //points.push(Vector2.NaV);
     // }
    }
    //console.log(points);
    for (let i = 0; i < points.length; i++) {
      drawLine(points[i]);
    }
  }, [color, func, roundXSrc]);
  useDrawable(drawableCB, +priority);
  return null;
}

export default FunctionGraph;
