import { useContext, useEffect } from "react";
import { useVector2, Vector2, type Vector2Like } from "../utils/Vector2";
import type { DrawableContext } from "./Drawable";
import DrawerContext from "./DrawerContext";
import type { NumberProp } from "../utils/number";

export type WheelControlProps =
  & {
    wheelSpeed?: NumberProp;
    func?: (
      delta: Vector2,
      context: DrawableContext,
      ev: WheelEvent,
    ) => Vector2Like;
    scaleRange?: [Vector2Like, Vector2Like];
  }
  & ({
    zoomFromMouse?: true;
    zoomFromCenter?: false;
  } | {
    zoomFromMouse?: false;
    zoomFromCenter: true;
  });

const defaultFunc = (delta: Vector2) => Vector2.of(delta.y - delta.x, delta.y);

const WheelControl = (props: WheelControlProps) => {
  const {
    wheelSpeed: wheelSpeedProp = 3,
    scaleRange,
  } = props;
  const wheelSpeed = +wheelSpeedProp;
  const zoomFromMouse = props.zoomFromMouse ?? !props.zoomFromCenter;
  const drawerContext = useContext(DrawerContext);
  const [v1, v2] = scaleRange?.map((v) => Vector2.like(v)) ||
    [Vector2.of(1e-10, 1e-10), Vector2.of(1e20, 1e20)];
  const rmin = useVector2(
    Vector2.of(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y)),
  );
  const rmax = useVector2(
    Vector2.of(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y)),
  );
  const func = props.func ?? defaultFunc;
  useEffect(() => {
    const wheelCallback = (ev: WheelEvent) => {
      const {
        drawableContext,
        getScale,
        setScale,
      } = drawerContext;
      if (drawableContext) {
        ev.preventDefault();
        const scale = getScale();
        const delta = func(
          Vector2.of(ev.deltaX, ev.deltaY).multiply(wheelSpeed / 10000),
          drawableContext,
          ev,
        );
        const newScale = Vector2.pow(10, Vector2.log(scale, 10).plus(delta))
          .clamp(rmin, rmax);
        setScale(newScale);
        if (zoomFromMouse) {
          const { getFocus, setFocus } = drawerContext;
          const deltaScale = newScale.divide(scale);
          const focus = getFocus();
          const mousePos = drawableContext.pixelCordsToAbsolute(
            Vector2.of(ev.offsetX, ev.offsetY),
          );
          setFocus(mousePos.minus(mousePos.minus(focus).scale(deltaScale)));
        }
      }
    };
    const canvas = drawerContext.canvasRenderingContext2D!.canvas;
    canvas.addEventListener("wheel", wheelCallback);
    return () => {
      canvas.removeEventListener("wheel", wheelCallback);
    };
  }, [drawerContext, wheelSpeed, zoomFromMouse, func, rmin, rmax]);
  return null;
};

export default WheelControl;
