import { ceil, round } from "kamikoto00lib";
import { useContext } from "react";
import { Vector2 } from "../utils/Vector2";
import { DrawableContextColor } from "./DrawableContext";
import DrawerContext from "./DrawerContext";

export interface GraphGridProps {
  color?: DrawableContextColor;
  xAxisColor?: DrawableContextColor | null;
  yAxisColor?: DrawableContextColor | null;
}

function GraphGrid(props: GraphGridProps) {
  const {
    color = "lightgray",
    xAxisColor = "grey",
    yAxisColor = "grey"
  } = props;
  const drawerContext = useContext(DrawerContext);
  drawerContext.useDrawable((ctx) => {
    const { setColor, drawLine, drawingZone, scale } = ctx;
    const t = Vector2.pow(10, Vector2.log(scale, 10).floor());
    const step = Vector2.from(scale.divide(t).toArray().map(t => {
      if (t >= 5) {
        return 5;
      }
      if (t >= 2) {
        return 2;
      }
      return 1;
    }) as [number, number]).scale(t).divide(10);
    //const step = Math.pow(10, Math.round(Math.log10(Math.min(scale.x, scale.y)) - 1));
    setColor(color);
    for (let x = ceil(drawingZone.left, step.x); x <= drawingZone.right; x += step.x) {
      const isCentral = yAxisColor && round(x, step.x) === 0;
      if (isCentral) {
        continue;
        //setColor(yAxisColor);
      }
      drawLine(
        Vector2.of(x, drawingZone.top),
        Vector2.of(x, drawingZone.bottom)
      );
      /*
      if (isCentral) {
        setColor(color);
      }*/
    }
    for (let y = ceil(drawingZone.bottom, step.y); y <= drawingZone.top; y += step.y) {
      const isCentral = xAxisColor && round(y, step.y) === 0;
      if (isCentral) {
        continue;
        //setColor(xAxisColor);
      }
      drawLine(
        Vector2.of(drawingZone.left, y),
        Vector2.of(drawingZone.right, y)
      );
      /*
      if (isCentral) {
        setColor(color);
      }*/
    };
    if (xAxisColor) {
      setColor(xAxisColor);
      drawLine(Vector2.of(drawingZone.left, 0), Vector2.of(drawingZone.right, 0));
    }
    if (yAxisColor) {
      setColor(yAxisColor);
      drawLine(Vector2.of(0, drawingZone.top), Vector2.of(0, drawingZone.bottom));
    }
  }, -10);
  return null;
}

export default GraphGrid;