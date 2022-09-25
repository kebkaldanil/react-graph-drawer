import { ceil } from "kamikoto00lib";
import clamp from "kamikoto00lib/clamp";
import { useContext } from "react";
import { Vector2 } from "../utils/Vector2";
import { DrawableContextColor } from "./DrawableContext";
import DrawerContext from "./DrawerContext";

export interface GraphGridLabelsProps {
  zeroColor?: DrawableContextColor;
  xAxisColor?: DrawableContextColor | null;
  yAxisColor?: DrawableContextColor | null;
  xAxisLabel?: string | null;
  yAxisLabel?: string | null;
  priority?: number;
}

function GraphGridLabels(props: GraphGridLabelsProps) {
  const {
    zeroColor = "black",
    xAxisColor = zeroColor,
    yAxisColor = zeroColor,
    xAxisLabel = "X",
    yAxisLabel = "Y",
    priority = -9,
  } = props;
  const drawerContext = useContext(DrawerContext);
  drawerContext.useDrawable((ctx) => {
    const { setColor, printText, drawingZone, scale, cordInPixel } = ctx;
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
    if (xAxisColor) {
      setColor(xAxisColor);
      if (xAxisLabel) {
        const y = clamp(drawingZone.bottom, 0, drawingZone.top + cordInPixel.y * 20);
        printText(xAxisLabel, Vector2.of(drawingZone.right, y).minus(Vector2.of(10, 5).scale(cordInPixel)));
      }
      for (let x = ceil(drawingZone.left - cordInPixel.x * 5, step.x); x <= drawingZone.right; x += step.x) {
        if (x === 0) {
          setColor(zeroColor);
        }
        const y = clamp(drawingZone.bottom, 0, drawingZone.top + cordInPixel.y * 20);
        const labelPoint = Vector2.of(x, y).plus(Vector2.of(5, -5).scale(cordInPixel));
        printText("" + +x.toFixed(10), labelPoint);
        if (x === 0) {
          setColor(xAxisColor);
        }
      }
    }
    if (yAxisColor) {
      setColor(yAxisColor);
      if (yAxisLabel) {
        const x = clamp(drawingZone.left, 0, drawingZone.right - cordInPixel.x * 20);
        printText(yAxisLabel, Vector2.of(x, drawingZone.top).plus(Vector2.of(5, 10).scale(cordInPixel)));
      }
      for (let y = ceil(drawingZone.bottom, step.y); y <= drawingZone.top; y += step.y) {
        if (y === 0) {
          if (xAxisColor) {
            continue;
          }
          setColor(zeroColor);
        }
        const x = clamp(drawingZone.left, 0, drawingZone.right - cordInPixel.x * 20);
        const labelPoint = Vector2.of(x, y).plus(Vector2.of(5, -5).scale(cordInPixel));
        printText("" + +y.toFixed(10), labelPoint);
        if (y === 0) {
          setColor(yAxisColor);
        }
      }
    }
  }, priority);
  return null;
}

export default GraphGridLabels;