import React, { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useVector2, Vector2 } from "../utils/Vector2";
import AnimatedGraphDrawer from "./AnimatedGraphDrawer";
import { DrawableContext } from "./DrawableContext";
import DrawerContext from "./DrawerContext";
import { GraphDrawerProps } from "./GraphDrawer";

export interface SmartGraphDrawerProps extends GraphDrawerProps {
  wheelSpeed?: number;
  animationTime?: number;
}

interface SmartGraphDrawerState {
  scale: Vector2;
  focus: Vector2;
  scaleSpeed: number;
  focusSpeed: number;
}

interface MouseMoveAction {
  type: "moveFocus";
  delta: Vector2;
}

interface WheelZoomAction {
  type: "changeZoom";
  mousePos?: Vector2;
  delta: number;
}

interface NewDefault {
  type: "newDefaultScale" | "newDefaultFocus";
  value: Vector2;
  animationTime: number;
}

type SmartGraphDrawerAction = MouseMoveAction | WheelZoomAction | NewDefault;

interface TouchData {
  center: Vector2;
  distance?: number;
}

const reducer = (state: SmartGraphDrawerState, action: SmartGraphDrawerAction): SmartGraphDrawerState => {
  switch (action.type) {
    case "changeZoom": {
      const { delta, mousePos } = action;
      const { scale, focus } = state;
      const newScale = Vector2.pow(10, Vector2.log(scale, 10).minus([delta, delta])).clamp([1e-10, 1e-10], [1e20, 1e20]);
      const deltaScale = newScale.divide(scale);
      const newFocus = mousePos ? mousePos.minus(mousePos.minus(focus).scale(deltaScale)) : focus;

      return {
        //...state,
        focus: newFocus,
        scale: newScale,
        focusSpeed: Infinity,
        scaleSpeed: Infinity
      };
    }
    case "moveFocus":
      return {
        ...state,
        focus: state.focus.plus(action.delta),
        focusSpeed: Infinity,
      };
    case "newDefaultScale": {
      const { value: newScale, animationTime } = action;
      const { scale } = state;
      console.log(Vector2.log(newScale.divide(scale)).length() / animationTime);
      return {
        ...state,
        scale: newScale,
        scaleSpeed: Vector2.log(newScale.divide(scale)).length() / animationTime
      };
    }
    case "newDefaultFocus": {
      const { value: newFocus, animationTime } = action;
      const { focus } = state;
      return {
        ...state,
        focus: newFocus,
        focusSpeed: newFocus.minus(focus).length() / animationTime
      };
    }
  }
  throw new Error();
};

const SmartGraphDrawer = forwardRef(
  (props: SmartGraphDrawerProps, ref: React.ForwardedRef<DrawerContext>) => {
    const {
      scale: defaultScaleProp = 10,
      focus: defaultFocusProp = Vector2.ZERO,
      wheelSpeed = 3,
      animationTime = 2,
      ...restProps
    } = props;
    const defaultScale = useVector2(defaultScaleProp);
    const defaultFocus = useVector2(defaultFocusProp);

    const initialState: SmartGraphDrawerState = {
      focus: defaultFocus,
      scale: defaultScale,
      scaleSpeed: Infinity,
      focusSpeed: Infinity,
    };
    const [state, dispatch] = useReducer(reducer, initialState);
    const [drawerContext, setDrawerContext] = useState<DrawerContext>();
    const lastTouchesDataRef = useRef<TouchData | null>(null);

    useLayoutEffect(() => {
      dispatch({
        type: "newDefaultScale",
        value: defaultScale,
        animationTime,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultScale]);
    useLayoutEffect(() => {
      dispatch({
        type: "newDefaultFocus",
        value: defaultFocus,
        animationTime,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultFocus]);
    useEffect(() => {
      if (drawerContext) {
        const mouseMoveCallBack = (ev: MouseEvent) => {
          //console.log(ev);
          if (ev.buttons & 1) {
            const drawableContext = drawerContext?.drawableContext;
            if (drawableContext) {
              const delta = Vector2.of(-ev.movementX, -ev.movementY).divide(window.devicePixelRatio).scale(drawableContext.cordInPixel);
              dispatch({
                type: "moveFocus",
                delta,
              });
              return true;
            }
          }
        };
        const wheelCallback = (ev: WheelEvent) => {
          const drawableContext = drawerContext.drawableContext;
          if (drawableContext) {
            const delta = ev.deltaY / -10000 * wheelSpeed;
            const mousePos = drawableContext.pixelCordsToAbsolute(Vector2.of(ev.offsetX, ev.offsetY));
            dispatch({
              type: "changeZoom",
              delta,
              mousePos
            });
            return true;
          }
        };
        const canvas = drawerContext.canvasRenderingContext2D!.canvas;
        canvas.addEventListener("mousemove", mouseMoveCallBack);
        canvas.addEventListener("wheel", wheelCallback);
        //canvas.addEventListener("touchmove", touchMoveCallback);
        return () => {
          canvas.removeEventListener("mousemove", mouseMoveCallBack);
          canvas.removeEventListener("wheel", wheelCallback);
          //canvas.removeEventListener("touchmove", touchMoveCallback);
        };
      }
    }, [drawerContext, wheelSpeed]);
    useEffect(() => {
      if (drawerContext) {
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
          const drawableContext = drawerContext.drawableContext;
          if (drawableContext) {
            const lastTouchesData = lastTouchesDataRef.current;
            switch (touches.length) {
              case 1: {
                const touch = Vector2.of(touches[0].pageX, touches[0].pageY);
                if (lastTouchesData) {
                  const delta = touch.minus(lastTouchesData.center).scale(drawableContext.cordInPixel).inverse();
                  dispatch({
                    type: "moveFocus",
                    delta,
                  });
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
                  const delta = center.minus(lastTouchesData.center).scale(drawableContext.cordInPixel).inverse();
                  dispatch({
                    type: "moveFocus",
                    delta
                  });
                  if (lastTouchesData.distance) {
                    dispatch({
                      type: "changeZoom",
                      delta: Math.log(distance / lastTouchesData.distance),// / drawableContext.canvasSize.length(),
                      mousePos: drawableContext.pixelCordsToAbsolute(center),
                    });
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
      }
    }, [drawerContext]);
    useImperativeHandle(ref, () => drawerContext!, [drawerContext]);
    const { scale, focus, scaleSpeed, focusSpeed } = state;
    return <AnimatedGraphDrawer
      scale={scale}
      focus={focus}
      ref={(ctx) => ctx && setDrawerContext(ctx)}
      scaleAnimationSpeed={scaleSpeed}
      focusAnimationSpeed={focusSpeed}
      {...restProps} />;
  }
);

export default SmartGraphDrawer;
