import { useContext } from "react";
import {
  type BaseDrawableProps,
  DrawerContext,
  PI,
  PiInDegree,
  Vector2,
} from ".";

export interface ClockProps extends BaseDrawableProps {}

//Just made this for fun ¯\_(ツ)_/¯
function Clock(props: ClockProps) {
  const { priority } = props;
  const { useDrawable } = useContext(DrawerContext);
  useDrawable((drawableContext) => {
    const date = new Date();
    const timeInSeconds =
      (date.valueOf() - date.getTimezoneOffset() * 60_000) / 1000 % 43_200;
    const hours = timeInSeconds / 3600;
    const minutes = hours * 60;
    const seconds = minutes * 60 | 0;
    const hours_fi = hours * PI / 6;
    const minutes_fi = minutes * PI / 30;
    const seconds_fi = seconds * PI / 30;
    const { setColor, drawLine } = drawableContext;
    setColor("black");
    drawLine([Vector2.of(0, 0), Vector2.fromAngle(hours_fi, 0.5)]);
    drawLine(Array.from({ length: 361 }, (_, i) => Vector2.fromAngle(i * PiInDegree, 1.2)));
    setColor("gray");
    drawLine([Vector2.of(0, 0), Vector2.fromAngle(minutes_fi, 0.75)]);
    setColor("red");
    drawLine([Vector2.of(0, 0), Vector2.fromAngle(seconds_fi, 1)]);
  }, priority);
  return null;
}

export default Clock;
