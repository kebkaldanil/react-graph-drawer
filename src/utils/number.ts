export type NumberProp = number | `${number}`;

export const moveNumberClosestToTargetByStep = (
  step: number,
  target: number,
  start = 0,
) => Math.trunc((target - start) / step) * step + start;

export const PI = Math.PI;
export const halfPI = PI / 2;
export const twoPI = PI * 2;
export const PiInDegree = PI / 180;
