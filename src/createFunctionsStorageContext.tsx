import { Dict } from "kamikoto00lib";
import { FunctionData, FunctionsStorageContext } from "./FunctionInputs";

export const createFunctionsStorageContext = (
  initialState: Dict<FunctionData> = { 0: { func: "" } },
  localStorageKey?: string,
): FunctionsStorageContext => {
  const onUpdateCallbacks: ((state: Dict<FunctionData>) => void)[] = [];
  initialState = { ...initialState };
  if (localStorageKey !== undefined) {
    const src = localStorage.getItem(localStorageKey);
    if (src) {
      try {
        initialState = JSON.parse(src);
      } catch { /* empty */ }
    }
  }
  let state: Dict<FunctionData> = initialState;
  let i = Object.keys(state).reduce((prev, cur) => Math.max(prev, +cur), 0) + 1;
  const onChange = () => {
    if (localStorageKey !== undefined) {
      localStorage.setItem(localStorageKey, JSON.stringify(state));
    }
    for (let i = 0; i < onUpdateCallbacks.length; i++) {
      onUpdateCallbacks[i](state);
    }
  };
  return {
    state,
    nextId: () => (i++).toString(16),
    onUpdate: (cb) => {
      const index = onUpdateCallbacks.length;
      onUpdateCallbacks[index] = cb;
      return () => {
        let i = index;
        if (onUpdateCallbacks[index] !== cb) {
          i = onUpdateCallbacks.indexOf(cb);
        }
        onUpdateCallbacks.splice(i, 1);
      };
    },
    removeFunctionRecord: (id) => {
      const { [id]: _, ...rest } = state;
      if (Object.keys(rest).length === 0) {
        return;
      }
      state = rest;
      onChange();
    },
    updateFunctionRecord: (id, data) => {
      state = {
        ...state,
        [id]: {
          func: "",
          ...state[id],
          ...data,
        },
      };
      onChange();
    },
  };
};
