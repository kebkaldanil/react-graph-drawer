import { ceil, round } from "kamikoto00lib";
import { useCallback, useContext } from "react";
import { Vector2 } from "../utils/Vector2";
import type { BaseDrawableProps, DrawableContext, DrawableContextColor } from "./Drawable";
import DrawerContext from "./DrawerContext";

export interface GraphGridProps extends BaseDrawableProps {
  color?: DrawableContextColor;
  xAxisColor?: DrawableContextColor | null;
  yAxisColor?: DrawableContextColor | null;
}

function GraphGrid(props: GraphGridProps) {
  const {
    color = "lightgray",
    xAxisColor = "grey",
    yAxisColor = "grey",
    priority = -20,
  } = props;
  const drawerContext = useContext(DrawerContext);
  const { useDrawable } = drawerContext;
  const drawableCB = useCallback((ctx: DrawableContext) => {
    const { setColor, drawLine, drawingZone, scale } = ctx;
    const t = Vector2.pow(10, Vector2.log(scale, 10).floor());
    const step = Vector2.from(
      scale.divide(t).toArray().map((t) => {
        if (t >= 5) {
          return 5;
        }
        if (t >= 2) {
          return 2;
        }
        return 1;
      }) as [number, number],
    ).scale(t).divide(10);
    setColor(color);
    for (
      let x = ceil(drawingZone.left, step.x);
      x <= drawingZone.right;
      x += step.x
    ) {
      const isCentral = yAxisColor && round(x, step.x) === 0;
      if (isCentral) {
        continue;
      }
      drawLine([
        Vector2.of(x, drawingZone.top),
        Vector2.of(x, drawingZone.bottom),
      ]);
    }
    for (
      let y = ceil(drawingZone.bottom, step.y);
      y <= drawingZone.top;
      y += step.y
    ) {
      const isCentral = xAxisColor && round(y, step.y) === 0;
      if (isCentral) {
        continue;
      }
      drawLine([
        Vector2.of(drawingZone.left, y),
        Vector2.of(drawingZone.right, y),
      ]);
    }
    if (xAxisColor) {
      setColor(xAxisColor);
      drawLine([
        Vector2.of(drawingZone.left, 0),
        Vector2.of(drawingZone.right, 0),
      ]);
    }
    if (yAxisColor) {
      setColor(yAxisColor);
      drawLine([
        Vector2.of(0, drawingZone.top),
        Vector2.of(0, drawingZone.bottom),
      ]);
    }
  }, [color, xAxisColor, yAxisColor]);
  useDrawable(drawableCB, priority);
  return null;
}

export default GraphGrid;
