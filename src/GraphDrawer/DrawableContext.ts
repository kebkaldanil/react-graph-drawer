import { Tuple } from "kamikoto00lib";
import { Vector2 } from "../utils/Vector2";
import { ZeroAngleRect } from "../utils/ZeroAngleRect";
import DrawerContext from "./DrawerContext";

export type DrawableContextColor = CanvasRenderingContext2D["strokeStyle"] & CanvasRenderingContext2D["fillStyle"] | Tuple<3 | 4, number>;


export interface PrintTextOptions {
  horizontalAlign?: CanvasTextAlign;
  verticalAlign?: CanvasTextBaseline;
}

export interface DrawableContext {
  drawLine(points: Vector2[]): this;
  printText(text: string, point: Vector2, options?: PrintTextOptions): this;
  setColor(color: DrawableContextColor): this;
  clear(): this;
  absoluteCordsToPixel<T extends Vector2 | Vector2[]>(value: T): T;
  pixelCordsToAbsolute<T extends Vector2 | Vector2[]>(value: T): T;
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
