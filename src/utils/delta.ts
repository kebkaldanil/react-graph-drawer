import { useMemo, useRef } from "react";

let defaultDelta = 0.017;

export const useDelta = (_defaultDelta = defaultDelta) => {
  const lastTimeMs = useRef<number | null>(null);
  return useMemo(() => ({
    get: () => {
      const timeMs = Date.now();
      const delta = lastTimeMs.current === null ? _defaultDelta : (timeMs - lastTimeMs.current) / 1000;
      lastTimeMs.current = timeMs;
      return delta;
    },
    reset: () => { lastTimeMs.current = null; }
  }), [_defaultDelta]);
};