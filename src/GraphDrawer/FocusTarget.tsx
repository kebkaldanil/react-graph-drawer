import { useContext, useEffect } from "react";
import { useVector2, Vector2Like } from "../utils/Vector2";
import DrawerContext from "./DrawerContext";

interface FocusTargetProps {
  value: Vector2Like;
  animationTime?: number;
}

const FocusTarget = (props: FocusTargetProps) => {
  const {
    value: focusProp,
    animationTime = 0,
  } = props;
  const drawerContext = useContext(DrawerContext);
  const focusTarget = useVector2(focusProp || drawerContext.getFocus());
  useEffect(() => {
    const speed = focusTarget.minus(drawerContext.getFocus()).length() / animationTime;
    if (animationTime === 0) {
      drawerContext.setFocus(focusTarget);
      return;
    }
    const drawable = drawerContext.addDrawable((drawableContext, deltaTime) => {
      const {
        getFocus,
        setFocus
      } = drawerContext;
      const focusChanged = setFocus(getFocus().moveTo(focusTarget, deltaTime * speed));
      if (!focusChanged) {
        drawable.remove();
      }
    }, Infinity);
    return drawable.remove;
  }, [animationTime, drawerContext, focusTarget]);
  return null;
};

export default FocusTarget;