import { useContext, useEffect } from "react";
import { useVector2, Vector2, Vector2Like } from "../utils/Vector2";
import DrawerContext from "./DrawerContext";

interface ScaleTargetProps {
  value: Vector2Like | number | `${number}`;
  animationTime?: number | `${number}`;
  noLogarithmicScale?: boolean;
}

const ScaleTarget = (props: ScaleTargetProps) => {
  const {
    value: scaleProp,
    animationTime = 0,
    noLogarithmicScale = false,
  } = props;
  const drawerContext = useContext(DrawerContext);
  const scaleTarget = useVector2(scaleProp || drawerContext.getScale());
  useEffect(() => {
    let speed: number;
    if (animationTime === 0) {
      drawerContext.setScale(scaleTarget);
      return;
    }
    let scaleTargetLog: Vector2;
    if (noLogarithmicScale) {
      speed = scaleTarget.minus(drawerContext.getScale()).length() / +animationTime;
    } else {
      speed = Vector2.log(scaleTarget.divide(drawerContext.getScale())).length() / +animationTime;
      scaleTargetLog = Vector2.log(scaleTarget);
    }
    const drawable = drawerContext.addDrawable((drawableContext, deltaTime) => {
      const {
        getScale,
        setScale,
      } = drawableContext.drawerContext;
      const scale = getScale();
      const focusChanged = setScale(
        noLogarithmicScale ?
          scale.moveTo(scaleTarget, deltaTime * speed) :
          Vector2.exp(
            Vector2.log(scale).moveTo(scaleTargetLog, deltaTime * speed)
          )
      );
      if (!focusChanged) {
        drawable.remove();
      }
    }, Infinity);
    return drawable.remove;
  }, [animationTime, drawerContext, noLogarithmicScale, scaleTarget]);
  return null;
};

export default ScaleTarget;