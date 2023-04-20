import { useCallback, useContext } from "react";
import { Vector2 } from "../utils/Vector2";
import { BaseDrawableProps, ComputedProp, DrawableContextColor } from "./Drawable";
import DrawerContext, { defaultPriority, DrawableCallback } from "./DrawerContext";
import { SimpleFunction } from "./FunctionGraph";

interface PolarGraphProps extends BaseDrawableProps {
  color?: DrawableContextColor;
  fiStart?: number | `${number}` | ComputedProp;
  fiEnd?: number | `${number}` | ComputedProp;
  fiStep?: number | `${number}` | ComputedProp;
  function: SimpleFunction;
}

const PolarGraph = (props: PolarGraphProps) => {
  const {
    fiStart: fiStartProp = 0,
    fiEnd: fiEndProp = +fiStartProp + Math.PI * 2,
    fiStep: fiStepProp,
    function: _function,
    color = "black",
    priority = defaultPriority,
  } = props;
  const fiStepSrc = typeof fiStepProp === "string" ? +fiStepProp : fiStepProp;
  const fiStartSrc = typeof fiStartProp === "string" ? +fiStartProp : fiStartProp;
  const fiEndSrc = typeof fiEndProp === "string" ? +fiEndProp : fiEndProp;
  const fiStepFunc: ComputedProp = useCallback((ctx) => {
    if (fiStepSrc === undefined) {
      const { drawableContext } = drawerContext;
      if (drawableContext === undefined) {
        return 0.1;
      }
      const fiStart = typeof fiStartSrc === "function" ? fiStartSrc(drawableContext) : +fiStartSrc;
      const fiEnd = typeof fiEndSrc === "function" ? fiEndSrc(drawableContext) : +fiEndSrc;
      return (fiEnd - fiStart) / 180;
    }
    if (typeof fiStepSrc === "function") {
      return fiStepSrc(ctx);
    }
    return fiStepSrc;
  }, [fiStepSrc]);
  const drawerContext = useContext(DrawerContext);
  const drawableCB: DrawableCallback = useCallback((drawableContext) => {
    const { setColor, drawLine } = drawableContext;
    const fiStep = fiStepFunc(drawableContext);
    const fiStart = typeof fiStartSrc === "function" ? fiStartSrc(drawableContext) : +fiStartSrc;
    const fiEnd = typeof fiEndSrc === "function" ? fiEndSrc(drawableContext) : +fiEndSrc;
    const points: Vector2[] = [];
    let fi = fiStart;
    points.push(Vector2.fromAngle(fi, _function(fi)));
    do {
      fi += fiStep;
      points.push(Vector2.fromAngle(fi, _function(fi)));
    } while (fi < fiEnd);
    setColor(color);
    drawLine(points);
  }, [_function, color, fiEndSrc, fiStartSrc, fiStepFunc]);
  drawerContext.useDrawable(drawableCB, +priority);
  return null;
};

export default PolarGraph;