import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useVector2, Vector2, Vector2Like } from "../utils/Vector2";
import { Drawable } from "./Drawable";
import DrawerContext, { initContext } from "./DrawerContext";

export interface GraphDrawerProps {
  children: Drawable | Drawable[];
  width: number;
  height: number;
  focus?: Vector2Like;
  scale?: number | Vector2Like;
  ref?: React.Ref<DrawerContext>;
}

const GraphDrawer = forwardRef(
  (props: GraphDrawerProps, ref: React.ForwardedRef<DrawerContext>) => {
    const {
      children,
      width,
      height,
      focus: focusProp = Vector2.ZERO,
      scale: scaleProp = 10,
    } = props;
    const scale = useVector2(scaleProp);
    const focus = useVector2(focusProp);
    const [context, setContext] = useState<DrawerContext | null>(null);

    useImperativeHandle(ref, () => context!, [context]);

    const canvasRefFunc = (canvas: HTMLCanvasElement | null) => {
      const canvasRenderingContext2D = canvas?.getContext("2d") || null;
      if (canvasRenderingContext2D && context?.canvasRenderingContext2D !== canvasRenderingContext2D) {
        setContext(initContext({ canvasRenderingContext2D }));
      }
    };

    useEffect(() => {
      context?.update({
        focus,
        scale
      });
    }, [context, focus, scale, width, height, children]);

    return <canvas ref={canvasRefFunc} width={width} height={height}>
      {context && <DrawerContext.Provider value={context}>{children}</DrawerContext.Provider>}
    </canvas>
  }
);

export default GraphDrawer;