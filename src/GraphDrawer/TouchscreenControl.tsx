import { useContext, useEffect, useRef } from "react";
import { Vector2 } from "../utils/Vector2";
import DrawerContext from "./DrawerContext";

interface TouchData {
  center: Vector2;
  touchesDelta?: Vector2;
}

export interface TouchscreenControlProps {
}

const TouchscreenControl = (props: TouchscreenControlProps) => {
  //const { } = props;
  const drawerContext = useContext(DrawerContext);
  const lastTouchesDataRef = useRef<TouchData | null>(null);
  useEffect(() => {
    const canvas = drawerContext.canvasRenderingContext2D!.canvas;
    const touchStartCallback = (ev: TouchEvent) => {
      const { touches } = ev;
      switch (touches.length) {
        case 1: {
          const touch = Vector2.of(touches[0].pageX, touches[0].pageY);
          lastTouchesDataRef.current = { center: touch };
          ev.preventDefault();
          break;
        }
        case 2: {
          const touch1 = Vector2.of(touches[0].pageX, touches[0].pageY);
          const touch2 = Vector2.of(touches[1].pageX, touches[1].pageY);
          const center = touch1.plus(touch2).divide(2);
          const touchesDelta = touch1.minus(touch2).abs();
          lastTouchesDataRef.current = { center, touchesDelta };
          ev.preventDefault();
          break;
        }
      }
    };
    const touchMoveCallback = (ev: TouchEvent) => {
      const { touches } = ev;
      const { drawableContext, getFocus, setFocus } = drawerContext;
      if (drawableContext) {
        const lastTouchesData = lastTouchesDataRef.current;
        switch (touches.length) {
          case 1: {
            const touch = Vector2.of(touches[0].pageX, touches[0].pageY);
            if (lastTouchesData) {
              const delta = touch.minus(lastTouchesData.center).scale(drawableContext.cordInPixel).inverse();
              const focus = getFocus();
              setFocus(focus.plus(delta));
            }
            lastTouchesDataRef.current = { center: touch };
            ev.preventDefault();
            break;
          }
          case 2: {
            const touch1 = Vector2.of(touches[0].pageX, touches[0].pageY);
            const touch2 = Vector2.of(touches[1].pageX, touches[1].pageY);
            const center = touch1.plus(touch2).divide(2);
            const touchesDelta = touch1.minus(touch2).abs();
            if (lastTouchesData) {
              const focus = getFocus();
              const focusDelta = center.minus(lastTouchesData.center).scale(drawableContext.cordInPixel).inverse();
              setFocus(focus.plus(focusDelta));
              if (lastTouchesData.touchesDelta) {
                const { getScale, setScale } = drawerContext;
                const scale = getScale();
                const delta = touchesDelta.minus(lastTouchesData.touchesDelta).scale(drawableContext.cordInPixel).inverseX().multiply(2);
                const newScale = scale.plus(delta);
                setScale(newScale);
              }
            }
            lastTouchesDataRef.current = { center, touchesDelta };
            ev.preventDefault();
            break;
          }
        }
      }
    };
    const touchEndCallback = (ev: TouchEvent) => {
      lastTouchesDataRef.current = null;
    };
    canvas.addEventListener("touchstart", touchStartCallback);
    canvas.addEventListener("touchmove", touchMoveCallback);
    canvas.addEventListener("touchend", touchEndCallback);
    return () => {
      canvas.removeEventListener("touchstart", touchStartCallback);
      canvas.removeEventListener("touchmove", touchMoveCallback);
      canvas.removeEventListener("touchend", touchEndCallback);
    };
  }, [drawerContext]);
  return null;
};

export default TouchscreenControl;
