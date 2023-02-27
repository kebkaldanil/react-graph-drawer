import { useContext } from "react";
import { BaseDrawableProps } from "./GraphDrawer/Drawable";
import DrawerContext from "./GraphDrawer/DrawerContext";
import { makeArray } from "./utils/makeArray";
import { Vector2 } from "./utils/Vector2";

export interface ClockProps extends BaseDrawableProps { }

function Clock(props: ClockProps) {
  const { priority } = props;
  const { useDrawable } = useContext(DrawerContext);
  useDrawable((drawableContext) => {
    const date = new Date();
    const timeInSeconds = (date.valueOf() - date.getTimezoneOffset() * 60_000) / 1000 % 43_200;
    const hours = timeInSeconds / 3600;
    const minutes = hours * 60;
    const seconds = minutes * 60 | 0;
    const hours_fi = hours * Math.PI / 6;
    const minutes_fi = minutes * Math.PI / 30;
    const seconds_fi = seconds * Math.PI / 30;
    const { setColor, drawLine } = drawableContext;
    setColor("black");
    drawLine([[0, 0], Vector2.fromAngle(hours_fi, 0.5)]);
    drawLine(makeArray(361, (i) => Vector2.fromAngle(i * Math.PI / 180, 1.2)));
    setColor("gray");
    drawLine([Vector2.of(0, 0), Vector2.fromAngle(minutes_fi, 0.75)]);
    setColor("red");
    drawLine([Vector2.of(0, 0), Vector2.fromAngle(seconds_fi, 1)]);
  }, priority);
  return null;
}

export default Clock;
