import { useCallback, useContext } from "react";
import { Vector2 } from "../utils/Vector2";
import { BaseDrawableProps } from "./Drawable";
import { DrawableContextColor, ComputedProp } from "./DrawableContext";
import DrawerContext, { defaultPriority, DrawableCallback } from "./DrawerContext";
import { SimpleFunction } from "./FunctionGraph";

interface LineGraphByTwoFunctionsPropsBase extends BaseDrawableProps {
  x: SimpleFunction;
  y: SimpleFunction;
  color?: DrawableContextColor;
  tStep?: number | `${number}` | ComputedProp;
}

interface ItRange {
  tStart: number | `${number}` | ComputedProp;
  tEnd: number | `${number}` | ComputedProp;
}

export type LineGraphByTwoFunctionsProps = LineGraphByTwoFunctionsPropsBase & ({} | ItRange);

const default_tStep = 0.01;

const LineGraphByTwoFunctions = (props: LineGraphByTwoFunctionsProps) => {
  const {
    priority = defaultPriority,
    color = "black",
    x: xFunc,
    y: yFunc,
    tStep: tStepProp = default_tStep,
    tStart: tStartProp = -10,
    tEnd: tEndProp = 10,
  } = props as LineGraphByTwoFunctionsPropsBase & Partial<ItRange>;
  const tStepSrc = typeof tStepProp === "string" ? +tStepProp : tStepProp;
  const tStartSrc = typeof tStartProp === "string" ? +tStartProp : tStartProp;
  const tEndSrc = typeof tEndProp === "string" ? +tEndProp : tEndProp;
  const drawerContext = useContext(DrawerContext);
  const drawableCB: DrawableCallback = useCallback((drawableContext) => {
    const {setColor, drawLine} = drawableContext;
    const tStep = typeof tStepSrc === "function" ? tStepSrc(drawableContext) : +tStepSrc;
    const tStart = typeof tStartSrc === "function" ? tStartSrc(drawableContext) : +tStartSrc;
    const tEnd = typeof tEndSrc === "function" ? tEndSrc(drawableContext) : +tEndSrc;
    const points: Vector2[] = [];
    for (let t = tStart; t <= tEnd; t += tStep) {
      const x = xFunc(t);
      const y = yFunc(t);
      points.push(Vector2.of(x, y));
    }
    setColor(color);
    drawLine(points);
  }, [color, tEndSrc, tStartSrc, tStepSrc, xFunc, yFunc]);
  drawerContext.useDrawable(drawableCB, +priority);
  return null;
};

export default LineGraphByTwoFunctions;