import { useMemo, useRef } from "react";

export let defaultDelta = 0.017;
export let maxDelta = 1;

export const useDelta = (_defaultDelta = defaultDelta, _maxDelta = maxDelta) => {
  const lastTimeMs = useRef<number | null>(null);
  return useMemo(() => ({
    get: () => {
      const timeMs = Date.now();
      const delta = lastTimeMs.current === null ? _defaultDelta : Math.min((timeMs - lastTimeMs.current) / 1000, _maxDelta);
      lastTimeMs.current = timeMs;
      return delta;
    },
    reset: () => { lastTimeMs.current = null; },
  }), [_defaultDelta, _maxDelta]);
};