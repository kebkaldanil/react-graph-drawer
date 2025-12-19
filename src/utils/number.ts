export type NumberProp = number | `${number}`;

export const moveNumberClosestToTargetByStep = (
  step: number,
  target: number,
  start = 0,
) => Math.trunc((target - start) / step) * step + start;

export const num2color = (v: number) => "#" + (v & 0xffffff).toString(16).padStart(6, "0");
export const tryColor2num = (c: string) => {
  if (c.startsWith("#")) {
    return Number.parseInt(c.slice(1), 16) & 0xffffff;
  }
  throw new Error();
};

export const PI = Math.PI;
export const halfPI = PI / 2;
export const twoPI = PI * 2;
export const PiInDegree = PI / 180;
