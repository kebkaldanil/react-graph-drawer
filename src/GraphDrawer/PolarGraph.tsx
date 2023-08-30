import { useCallback, useContext } from "react";
import { useVector2, Vector2, Vector2Like } from "../utils/Vector2";
import {
  BaseDrawableProps,
  ComputedProp,
  DrawableContextColor,
} from "./Drawable";
import DrawerContext, {
  defaultPriority,
  DrawableCallback,
} from "./DrawerContext";
import { SimpleFunction } from "./FunctionGraph";
import { halfPI, NumberProp, PiInDegree, twoPI } from "../utils/number";

interface PolarGraphProps extends BaseDrawableProps {
  color?: DrawableContextColor;
  start?: NumberProp | ComputedProp;
  end?: NumberProp | ComputedProp;
  step?: NumberProp | ComputedProp;
  position?: Vector2Like;
  func: SimpleFunction;
}

const PolarGraph = (props: PolarGraphProps) => {
  const {
    start: startProp = 0,
    end: endProp = +startProp + twoPI,
    step: stepProp,
    func,
    color = "black",
    priority = defaultPriority,
    position: positionSrc = Vector2.ZERO,
  } = props;
  const stepSrc = typeof stepProp === "string" ? +stepProp : stepProp;
  const startSrc = typeof startProp === "string" ? +startProp : startProp;
  const endSrc = typeof endProp === "string" ? +endProp : endProp;
  const position = useVector2(positionSrc);
  const drawerContext = useContext(DrawerContext);
  const stepFunc: ComputedProp = useCallback((ctx) => {
    if (stepSrc === undefined) {
      const { drawableContext } = drawerContext;
      if (drawableContext === undefined) {
        return PiInDegree;
      }
      const start = typeof startSrc === "function"
        ? startSrc(drawableContext)
        : +startSrc;
      const end = typeof endSrc === "function"
        ? endSrc(drawableContext)
        : +endSrc;
      return (end - start) / 180;
    }
    if (typeof stepSrc === "function") {
      return stepSrc(ctx);
    }
    return stepSrc;
  }, [drawerContext, endSrc, startSrc, stepSrc]);
  const drawableCB: DrawableCallback = useCallback((drawableContext) => {
    const { setColor, drawLine } = drawableContext;
    const step = stepFunc(drawableContext);
    const start = typeof startSrc === "function"
      ? startSrc(drawableContext)
      : +startSrc;
    const end = typeof endSrc === "function"
      ? endSrc(drawableContext)
      : +endSrc;
    const points: Vector2[] = [];
    let theta = start;
    points.push(Vector2.fromAngle(-theta + halfPI, func(theta)).plus(position));
    do {
      theta += step;
      points.push(
        Vector2.fromAngle(-theta + halfPI, func(theta)).plus(position),
      );
    } while (theta < end);
    setColor(color);
    drawLine(points);
  }, [func, color, endSrc, position, startSrc, stepFunc]);
  drawerContext.useDrawable(drawableCB, +priority);
  return null;
};

export default PolarGraph;
