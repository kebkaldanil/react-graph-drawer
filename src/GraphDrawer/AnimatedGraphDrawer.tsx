import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useDelta } from "../utils/delta";
import { useVector2, Vector2 } from "../utils/Vector2";
import DrawerContext from "./DrawerContext";
import GraphDrawer, { GraphDrawerProps } from "./GraphDrawer";

type Interval = ReturnType<typeof setInterval>;

export interface AnimatedGraphDrawerProps extends GraphDrawerProps {
  focusAnimationSpeed?: number;
  scaleAnimationSpeed?: number;
  useLogarithmicScaleAnimation?: boolean;
  maxFPS?: number;
  timeout?: number;
}

function AnimatedGraphDrawer(props: AnimatedGraphDrawerProps, ref: React.ForwardedRef<DrawerContext>) {
  const {
    focus: focusTargetProp = Vector2.ZERO,
    scale: scaleTargetProp = 10,
    focusAnimationSpeed = 1,
    scaleAnimationSpeed = 1,
    useLogarithmicScaleAnimation = true,
    timeout,
    maxFPS = 60,
    ...restProps
  } = props;
  const delayMs = 1000 / maxFPS;
  const focusTarget = useVector2(focusTargetProp);
  const scaleTarget = useVector2(scaleTargetProp);
  const [focus, setFocus] = useState(focusTarget);
  const [scale, setScale] = useState(scaleTarget);
  const intervalRef = useRef<Interval | null>(null);
  const deltaTimer = useDelta(delayMs / 1000);
  const doUpdate = !(focus.equals(focusTarget) && scale.equals(scaleTarget));
  console.log({
    scale, focus, scaleTarget, focusTarget
  });
  useEffect(() => {
    if (doUpdate) {
      if (focusAnimationSpeed === Infinity && scaleAnimationSpeed === Infinity) {
        setFocus(focusTarget);
        setScale(scaleTarget);
        return;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        deltaTimer.reset();
      }
      intervalRef.current = setInterval(() => {
        const delta = deltaTimer.get();
        setFocus(focus => focus.moveTo(focusTarget, delta * focusAnimationSpeed));
        setScale(scale => {
          if (useLogarithmicScaleAnimation) {
            const logTarget = Vector2.log(scaleTarget);
            const logScale = Vector2.log(scale);
            return Vector2.pow(
              Math.E,
              logScale.moveTo(logTarget, delta * scaleAnimationSpeed)
            ).round(1e-10);
          }
          return scale.moveTo(scaleTarget, delta * scaleAnimationSpeed);
        });
      }, delayMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        deltaTimer.reset();
      }
    }
  }, [delayMs, deltaTimer, doUpdate, focusAnimationSpeed, focusTarget, scaleAnimationSpeed, scaleTarget, useLogarithmicScaleAnimation]);
  return <GraphDrawer focus={focusAnimationSpeed === Infinity ? focusTarget : focus} scale={scaleAnimationSpeed === Infinity ? scaleTarget : scale} ref={ref} {...restProps} />;
}

export default forwardRef(AnimatedGraphDrawer);
