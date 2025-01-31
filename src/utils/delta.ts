import { useMemo, useRef } from "react";
import { If, IsNotNegative } from "kamikoto00lib";

export let defaultDelta = 0.017;
export let defaultMaxDelta = 1;

export const setDefaultDelta = <const T extends number>(
  value: If<IsNotNegative<T>, T>,
) => defaultDelta = value;
export const setDefaultMaxDelta = <const T extends number>(
  value: If<IsNotNegative<T>, T>,
) => defaultMaxDelta = value;

export const useDelta = (
  _defaultDelta = defaultDelta,
  _maxDelta = defaultMaxDelta,
) => {
  const lastTimeMs = useRef<number | null>(null);
  return useMemo(() => ({
    get: (time: number) => {
      const delta = lastTimeMs.current === null
        ? _defaultDelta
        : Math.min((time - lastTimeMs.current) / 1000, _maxDelta);
      lastTimeMs.current = time;
      return delta;
    },
    reset: (time?: number | null) => {
      lastTimeMs.current = time ?? null;
    },
  }), [_defaultDelta, _maxDelta]);
};
