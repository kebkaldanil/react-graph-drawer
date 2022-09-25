import { useContext, useEffect, useRef } from "react";
import { Vector2 } from "../utils/Vector2";
import DrawerContext from "./DrawerContext";

interface TouchData {
  center: Vector2;
  distance?: number;
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
          const distance = touch1.minus(touch2).length();
          lastTouchesDataRef.current = { center, distance };
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
            const distance = touch1.minus(touch2).length();
            if (lastTouchesData) {
              const focus = getFocus();
              const delta = center.minus(lastTouchesData.center).scale(drawableContext.cordInPixel).inverse();
              setFocus(focus.plus(delta));
              if (lastTouchesData.distance) {
                const { getScale, setScale } = drawerContext;
                const scale = getScale();
                const delta = Math.log(distance / lastTouchesData.distance);
                const newScale = Vector2.pow(10, Vector2.log(scale, 10).minus([delta, delta])).clamp([1e-10, 1e-10], [1e20, 1e20]);
                const deltaScale = newScale.divide(scale);
                const actualCenter = drawableContext.pixelCordsToAbsolute(center);
                const newFocus = actualCenter.minus(actualCenter.minus(focus).scale(deltaScale));
                setScale(newScale);
                setFocus(newFocus);
              }
            }
            lastTouchesDataRef.current = { center, distance };
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
