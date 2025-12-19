import React, {
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDelta } from "../utils/delta";
import { useUpdate } from "../utils/updateHook";
import { useVector2, Vector2, type Vector2Like } from "../utils/Vector2";
import DrawerContext, { initContext } from "./DrawerContext";
import type { NumberProp } from "../utils/number";

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
>;

export type GraphDrawerProps =
  & MainGraphDrawerProps
  & CanvasProps
  & (
    {
      /**Canvas size*/
      size?: Vector2Like;
      width?: undefined;
      height?: undefined;
    } | {
      /**Initial width*/
      width: number | string;
      /**Initial height*/
      height: number | string;
      size?: undefined;
    }
  );

interface MainGraphDrawerProps {
  children?: ReactNode | ReactNode[];
  /**Initial focus*/
  focus?: Vector2Like;
  /**Initial scale*/
  scale?: NumberProp | Vector2Like;
  /**
   * Reference to context
   * Warning: might be null
   */
  ref?: React.Ref<DrawerContext>;
}

interface GraphDrawerState {
  scale: Vector2;
  focus: Vector2;
  size: Vector2;
}

const GraphDrawer = forwardRef(
  (props: GraphDrawerProps, ref: React.ForwardedRef<DrawerContext>) => {
    const {
      children,
      width: initialWidth,
      height: initialHeight,
      size: sizeProp = Vector2.NaV,
      focus: initialFocus = Vector2.ZERO,
      scale: initialScale = 10,
      ...rest
    } = props;

    const delta = useDelta();
    const forceUpdate = useUpdate();
    const stateRef = useRef<GraphDrawerState>(null);
    const doUpdateRef = useRef(true);
    const [context, setContext] = useState<DrawerContext>();
    const sizeTarget = useVector2(
      Vector2.from(sizeProp).validOrDefault([
        +initialWidth! || 300,
        +initialHeight! || 100,
      ]),
      (sizePropTarget) =>
        stateRef.current && (stateRef.current.size = sizePropTarget),
    );
    if (!stateRef.current) {
      stateRef.current = {
        scale: Vector2.from(initialScale),
        focus: Vector2.from(initialFocus),
        size: sizeTarget,
      };
    }

    useImperativeHandle(ref, () => context!, [context]);

    const canvasRefFunc = (canvas: HTMLCanvasElement | null) => {
      const canvasRenderingContext2D = canvas?.getContext("2d");
      if (
        canvasRenderingContext2D &&
        context?.canvasRenderingContext2D !== canvasRenderingContext2D
      ) {
        const state = stateRef.current!;
        const context = initContext({
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
            state.focus = newFocus;
            return doUpdateRef.current = true;
          },
          getSize: () => state.size,
          setSize: (value) => {
            const newSize = Vector2.from(value);
            if (newSize.is(state.size)) {
              return false;
            }
            context.onSizeUpdate(state.size = newSize);
            forceUpdate();
            return true;
          },
        });
        setContext(context);
      }
    };

    doUpdateRef.current = true;

    useLayoutEffect(() => {
      stateRef.current!.size = sizeTarget;
      if (context) {
        context.onSizeUpdate(sizeTarget);
      }
    }, [context, sizeTarget]);

    useEffect(() => {
      if (context) {
        let id = 0;
        const makeUpdateRequest = () => id = requestAnimationFrame((time) => {
          if (doUpdateRef.current) {
            doUpdateRef.current = false;
            context.update({
              ...stateRef.current!,
              deltaTime: delta.get(time),
            });
          } else {
            delta.reset(time);
          }
          makeUpdateRequest();
        });
        makeUpdateRequest();
        delta.reset(null);
        return () => cancelAnimationFrame(id);
      }
    }, [context, delta]);
    const { size } = stateRef.current;
    return (
      <canvas ref={canvasRefFunc} width={size.x} height={size.y} {...rest}>
        {context && (
          <DrawerContext.Provider value={context}>
            {children}
          </DrawerContext.Provider>
        )}
      </canvas>
    );
  },
);

export default GraphDrawer;
