import { useContext, useEffect } from "react";
import { Vector2 } from "../utils/Vector2";
import DrawerContext from "./DrawerContext";
import { MouseButton } from "./MouseButton";

export interface MouseMoveControlProps {
  buttons?: MouseButton[] | MouseButton;
}

const MouseControl = (props: MouseMoveControlProps) => {
  const {
    buttons = MouseButton.Primary,
  } = props;
  const buttonsFlags = typeof buttons === "number"
    ? buttons
    : buttons.reduce((prev, cur) => prev | cur, 0);
  const drawerContext = useContext(DrawerContext);
  useEffect(() => {
    const mouseMoveCallBack = (ev: MouseEvent) => {
      if (ev.buttons & buttonsFlags) {
        const {
          drawableContext,
          getFocus,
          setFocus,
        } = drawerContext;
        if (drawableContext) {
          const focus = getFocus();
          const delta = Vector2.of(-ev.movementX, -ev.movementY).divide(
            window.devicePixelRatio,
          ).scale(drawableContext.cordInPixel);
          setFocus(focus.plus(delta));
          ev.preventDefault();
        }
      }
    };
    const canvas = drawerContext.canvasRenderingContext2D!.canvas;
    canvas.addEventListener("mousemove", mouseMoveCallBack);
    return () => {
      canvas.removeEventListener("mousemove", mouseMoveCallBack);
    };
  }, [buttonsFlags, drawerContext]);
  return null;
};

export default MouseControl;
