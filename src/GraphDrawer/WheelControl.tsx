import { useContext, useEffect } from "react";
import { Vector2 } from "../utils/Vector2";
import DrawerContext from "./DrawerContext";

export type WheelControlProps = {
  wheelSpeed?: number;
} & ({
  zoomFromMouse?: true;
  zoomFromCenter?: false;
} | {
  zoomFromMouse?: false;
  zoomFromCenter: true;
});

const WheelControl = (props: WheelControlProps) => {
  const {
    wheelSpeed = 3,
  } = props;
  const zoomFromMouse = props.zoomFromMouse ?? !props.zoomFromCenter;
  const drawerContext = useContext(DrawerContext);
  useEffect(() => {
    const wheelCallback = (ev: WheelEvent) => {
      const {
        drawableContext,
        getScale,
        setScale,
      } = drawerContext;
      if (drawableContext) {
        const scale = getScale();
        const delta = ev.deltaY / -10000 * wheelSpeed;
        const newScale = Vector2.pow(10, Vector2.log(scale, 10).minus([delta, delta])).clamp([1e-10, 1e-10], [1e20, 1e20]);
        setScale(newScale);
        if (zoomFromMouse) {
          const { getFocus, setFocus } = drawerContext;
          const deltaScale = newScale.divide(scale);
          const focus = getFocus();
          const mousePos = drawableContext.pixelCordsToAbsolute(Vector2.of(ev.offsetX, ev.offsetY));
          setFocus(mousePos.minus(mousePos.minus(focus).scale(deltaScale)));
        }
      }
    };
    const canvas = drawerContext.canvasRenderingContext2D!.canvas;
    canvas.addEventListener("wheel", wheelCallback);
    return () => {
      canvas.removeEventListener("wheel", wheelCallback);
    };
  }, [drawerContext, wheelSpeed, zoomFromMouse]);
  return null;
};

export default WheelControl;
