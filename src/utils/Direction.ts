export enum Direction {
  inside = 0,
  left = 1,
  right = 0b11,
  top = 0b100,
  bottom = 0b1100,
  "left top" = left | top,
  "left bottom" = left | bottom,
  "right top" = right | top,
  "right bottom" = right | bottom,
}

export function fix(val: Direction | number): Direction {
  return (val & Direction.left && val & Direction.right) |
    (val & Direction.top && val & Direction.bottom);
}

export function atSameSide(s1: Direction, s2: Direction) {
  return (s1 === Direction.inside && s2 === Direction.inside) || (
    horisontalOnly(s1) && horisontalOnly(s1) === horisontalOnly(s2)
  ) || (
    verticalOnly(s1) && verticalOnly(s1) === verticalOnly(s2)
  );
}

export function verticalOnly(val: Direction): Direction {
  return val & Direction.bottom;
}

export function horisontalOnly(val: Direction): Direction {
  return val & Direction.right;
}

export function findSameSide(s1: Direction, s2: Direction) {
  const s1h = horisontalOnly(s1);
  const s2h = horisontalOnly(s2);
  const s1v = verticalOnly(s1);
  const s2v = verticalOnly(s2);
  return (s1h === s2h ? s1h : Direction.inside) |
    (s1v === s2v ? s1v : Direction.inside);
}

export function oposite(val: Direction): Direction {
  const horisontal = horisontalOnly(val);
  const vertical = verticalOnly(val);
  return (horisontal && horisontal ^ 0b10) | (vertical && vertical ^ 0b1000);
}

export function isCorner(val: Direction) {
  return val && Boolean((verticalOnly(val) && 1) ^ (horisontalOnly(val) && 1));
}
