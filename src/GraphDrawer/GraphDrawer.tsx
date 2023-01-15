import React, { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useDelta } from "../utils/delta";
import { useVector2, Vector2, Vector2Like } from "../utils/Vector2";
import DrawerContext, { initContext } from "./DrawerContext";

export type GraphDrawerProps = MainGraphDrawerProps & (
  {
    size?: Vector2Like;
    width?: undefined;
    height?: undefined;
  } | {
    width: number | string;
    height: number | string;
    size?: undefined;
  }
);

interface MainGraphDrawerProps {
  children?: ReactNode;
  defaultFocus?: Vector2Like;
  defaultScale?: number | `${number}` | Vector2Like;
  ref?: React.Ref<DrawerContext>;
  updatePeriodMs?: number;
}

interface GraphDrawerState {
  scale: Vector2;
  focus: Vector2;
}

const GraphDrawer = forwardRef((props: GraphDrawerProps, ref: React.ForwardedRef<DrawerContext>) => {
  const {
    children,
    width: widthProp,
    height: heightProp,
    size: sizeProp = Vector2.NaV,
    defaultFocus = Vector2.ZERO,
    defaultScale = 10,
    updatePeriodMs = 16,
  } = props;
  const size = useVector2(sizeProp);

  const stateRef = useRef<GraphDrawerState>();
  const doUpdateRef = useRef(true);
  if (stateRef.current === undefined) {
    stateRef.current = {
      scale: Vector2.from(defaultScale),
      focus: Vector2.from(defaultFocus),
    };
  }
  const state = stateRef.current;

  const [context, setContext] = useState<DrawerContext | null>(null);
  const delta = useDelta();

  const [width, height] = size.hasNaN() ? [widthProp || 300, heightProp || 150] : size.toArray();

  useImperativeHandle(ref, () => context!, [context]);

  const canvasRefFunc = (canvas: HTMLCanvasElement | null) => {
    const canvasRenderingContext2D = canvas?.getContext("2d") || null;
    if (canvasRenderingContext2D && context?.canvasRenderingContext2D !== canvasRenderingContext2D) {
      setContext(initContext({
        canvasRenderingContext2D,
        getScale: () => state.scale,
        getFocus: () => state.focus,
        setScale: (value) => {
          const newScale = Vector2.from(value);
          if (newScale.equals(state.scale)) {
            return false;
          }
          state.scale = newScale;
          return doUpdateRef.current = true;
        },
        setFocus: (value) => {
          const newFocus = Vector2.from(value);
          if (newFocus.equals(state.focus)) {
            return false;
          }
          state.focus = Vector2.from(value);
          return doUpdateRef.current = true;
        },
      }));
    }
  };

  doUpdateRef.current = true;
  useEffect(() => {
    if (context) {
      context.updateCanvasSize(Vector2.of(+width, +height));
      doUpdateRef.current = true;
    }
  }, [context, height, width]);

  useEffect(() => {
    if (context) {
      const interval = setInterval(() => {
        if (doUpdateRef.current) {
          doUpdateRef.current = false;
          context.update({
            ...state,
            deltaTime: delta.get()
          });
        } else {
          delta.reset();
        }
      }, updatePeriodMs);
      return () => clearInterval(interval);
    }
  }, [context, delta, state, updatePeriodMs]);

  return <canvas ref={canvasRefFunc} width={width} height={height}>
    {context && <DrawerContext.Provider value={context}>{children}</DrawerContext.Provider>}
  </canvas>
});

export default GraphDrawer;