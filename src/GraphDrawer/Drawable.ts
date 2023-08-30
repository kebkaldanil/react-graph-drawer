import { Tuple } from "kamikoto00lib";
import { Vector2, Vector2Like } from "../utils/Vector2";
import { ZeroAngleRect } from "../utils/ZeroAngleRect";
import DrawerContext from "./DrawerContext";
import { NumberProp } from "../utils/number";

export interface BaseDrawableProps {
  priority?: NumberProp;
}

export interface PrintTextOptions {
  horizontalAlign?: CanvasTextAlign;
  verticalAlign?: CanvasTextBaseline;
  margin?: NumberProp | Vector2Like;
  font?: string;
}

export type DrawableContextColor =
  | CanvasRenderingContext2D["strokeStyle"]
    & CanvasRenderingContext2D["fillStyle"]
  | Tuple<3 | 4, number>;

export interface DrawableContext {
  drawLine(points: Vector2Like[]): this;
  printText(
    text: string | number | bigint,
    point: Vector2Like,
    options?: PrintTextOptions,
  ): this;
  setColor(color: DrawableContextColor): this;
  clear(): this;
  absoluteCordsToPixel<T extends Vector2 | Vector2[]>(
    value: T,
  ): T & (Vector2 | Vector2[]);
  pixelCordsToAbsolute<T extends Vector2 | Vector2[]>(
    value: T,
  ): T & (Vector2 | Vector2[]);
  drawingZone: ZeroAngleRect;
  cordInPixel: Vector2;
  scale: Vector2;
  focus: Vector2;
  canvasSize: Vector2;
  drawerContext: DrawerContext;
}

export interface Drawable {
  remove(): void;
}

export type ComputedProp = (ctx: DrawableContext) => number;
