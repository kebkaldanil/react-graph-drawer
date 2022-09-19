import { useContext } from "react";
import { Vector2 } from "../utils/Vector2";
import { Drawable } from "./Drawable";
import { DrawableContextColor } from "./DrawableContext";
import DrawerContext from "./DrawerContext";

export type SimpleFunction = (x: number) => number;
export type MultipleResultFunction = (x: number) => number[];

export interface FunctionGraphProps {
  function: SimpleFunction | MultipleResultFunction;
  color?: DrawableContextColor;
  priority?: number;
}

function FunctionGraph(props: FunctionGraphProps): Drawable {
  const { useDrawable } = useContext(DrawerContext);
  const {
    function: func,
    color = "black",
    priority = 100,
  } = props;
  useDrawable((ctx) => {
    const { setColor, drawLine, canvasSize, cordInPixel: realScale, drawingZone } = ctx;
    setColor(color);
    const points: Vector2[][] = [[]];
    for (let xp = 0; xp < canvasSize.x; xp++) {
      const x = xp * realScale.x + drawingZone.left;
      const y = func(x);
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
    for (let i = 0; i < points.length; i++) {
      drawLine(...points[i]);
    }
  }, priority);
  return null as unknown as Drawable;
}

export default FunctionGraph;
