import { ceil, clamp } from "kamikoto00lib";
import { useCallback, useContext } from "react";
import { Vector2 } from "../utils/Vector2";
import { BaseDrawableProps, PrintTextOptions } from "./Drawable";
import { DrawableContext, DrawableContextColor } from "./Drawable";
import DrawerContext from "./DrawerContext";

export interface GraphGridLabelsProps extends BaseDrawableProps {
  zeroColor?: DrawableContextColor;
  xAxisColor?: DrawableContextColor | null;
  yAxisColor?: DrawableContextColor | null;
  xAxisLabel?: string | null;
  yAxisLabel?: string | null;
}

function GraphGridLabels(props: GraphGridLabelsProps) {
  const {
    zeroColor = "black",
    xAxisColor = zeroColor,
    yAxisColor = zeroColor,
    xAxisLabel = "X",
    yAxisLabel = "Y",
    priority = -10,
  } = props;
  const drawerContext = useContext(DrawerContext);
  const drawableCB = useCallback((ctx: DrawableContext) => {
    const { setColor, printText, drawingZone, scale, cordInPixel } = ctx;
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
    const textWidth = ("" + step.y).length + 1;
    const numbersPrintTextOption: PrintTextOptions = {
      verticalAlign: "bottom",
      horizontalAlign: "left",
      margin: 5,
      font: "10px",
    };
    let i: number;
    if (xAxisColor) {
      setColor(xAxisColor);
      let end = drawingZone.right;
      if (xAxisLabel) {
        const xAxisPrintTextOption: PrintTextOptions = {
          ...numbersPrintTextOption,
          horizontalAlign: "right",
        };
        const y = clamp(
          drawingZone.bottom,
          0,
          drawingZone.top + cordInPixel.y * 20,
        );
        printText(
          xAxisLabel,
          Vector2.of(drawingZone.right, y),
          xAxisPrintTextOption,
        );
        end -= cordInPixel.x * (textWidth * 10 + 4);
      }
      for (
        i = ceil(drawingZone.left - cordInPixel.x * 5, step.x);
        i < end;
        i += step.x
      ) {
        const x = +i.toFixed(11);
        if (x === 0) {
          setColor(zeroColor);
        }
        const y = clamp(
          drawingZone.bottom,
          0,
          drawingZone.top + cordInPixel.y * 20,
        );
        printText(x, [x, y], numbersPrintTextOption);
        if (x === 0) {
          setColor(xAxisColor);
        }
      }
    }
    if (yAxisColor) {
      const yAxisPrintTextOption: PrintTextOptions = {
        ...numbersPrintTextOption,
        verticalAlign: "top",
      };
      setColor(yAxisColor);
      const x = clamp(
        drawingZone.left,
        0,
        drawingZone.right - cordInPixel.x * textWidth * 7,
      );
      let end = drawingZone.top;
      if (yAxisLabel) {
        printText(yAxisLabel, [x, drawingZone.top], yAxisPrintTextOption);
        end += cordInPixel.y * 30;
      }
      for (i = ceil(drawingZone.bottom, step.y); i < end; i += step.y) {
        const y = +i.toFixed(11);
        if (y === 0) {
          if (xAxisColor) {
            continue;
          }
          setColor(zeroColor);
        }
        printText(y, [x, y], numbersPrintTextOption);
        if (y === 0) {
          setColor(yAxisColor);
        }
      }
    }
  }, [xAxisColor, xAxisLabel, yAxisColor, yAxisLabel, zeroColor]);
  drawerContext.useDrawable(drawableCB, priority);
  return null;
}

export default GraphGridLabels;
