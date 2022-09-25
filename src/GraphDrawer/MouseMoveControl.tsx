import { useContext, useEffect } from "react";
import { Vector2 } from "../utils/Vector2";
import DrawerContext from "./DrawerContext";

export enum MouseButton {
  /**No button or un-initialized */
  NoButton = 0,
  /**Primary button (usually the left button) */
  Primary = 1,
  /**Secondary button (usually the right button) */
  Secondary = 2,
  /**Auxiliary button (usually the mouse wheel button or middle button) */
  Auxiliary = 4,
  /**4th button (typically the "Browser Back" button) */
  B4 = 8,
  /**5th button (typically the "Browser Forward" button) */
  B5 = 16,
}

export interface MouseMoveControlProps {
  buttons?: MouseButton[] | MouseButton;
}

const MouseMoveControl = (props: MouseMoveControlProps) => {
  const {
    buttons = MouseButton.Primary,
  } = props;
  const buttonsFlags = typeof buttons === "number" ? buttons : buttons.reduce((prev, cur) => prev | cur, 0);
  const drawerContext = useContext(DrawerContext);
  useEffect(() => {
    const mouseMoveCallBack = (ev: MouseEvent) => {
      //console.log(ev);
      if (ev.buttons & buttonsFlags) {
        const {
          drawableContext,
          getFocus,
          setFocus,
        } = drawerContext;
        if (drawableContext) {
          const focus = getFocus();
          const delta = Vector2.of(-ev.movementX, -ev.movementY).divide(window.devicePixelRatio).scale(drawableContext.cordInPixel);
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

export default MouseMoveControl;
