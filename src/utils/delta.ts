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
    get: () => {
      const timeMs = Date.now();
      const delta = lastTimeMs.current === null
        ? _defaultDelta
        : Math.min((timeMs - lastTimeMs.current) / 1000, _maxDelta);
      lastTimeMs.current = timeMs;
      return delta;
    },
    reset: () => {
      lastTimeMs.current = null;
    },
  }), [_defaultDelta, _maxDelta]);
};
