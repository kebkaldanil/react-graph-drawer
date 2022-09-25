import { useContext, useEffect } from "react";
import { useVector2, Vector2, Vector2Like } from "../utils/Vector2";
import DrawerContext from "./DrawerContext";

interface ScaleTargetProps {
  value: Vector2Like;
  animationTime?: number;
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
    if (noLogarithmicScale) {
      speed = scaleTarget.minus(drawerContext.getScale()).length() / animationTime;
    } else {
      speed = Math.log(scaleTarget.divide(drawerContext.getScale()).length()) / animationTime;
    }
    if (animationTime === 0) {
      drawerContext.setScale(scaleTarget);
      return;
    }
    const drawable = drawerContext.addDrawable((drawableContext, deltaTime) => {
      const {
        getScale,
        setScale,
      } = drawerContext;
      const scale = getScale();
      const focusChanged = setScale(
        noLogarithmicScale ?
          scale.moveTo(scaleTarget, deltaTime * speed) :
          Vector2.pow(
            Math.E,
            Vector2.log(scale).moveTo(Vector2.log(scaleTarget), deltaTime * speed)
          ).round(1e-10)
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