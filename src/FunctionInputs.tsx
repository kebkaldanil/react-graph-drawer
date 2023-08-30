import React, { useContext, useEffect, useState } from "react";
import "./FunctionInputs.css";
import { Dict } from "kamikoto00lib";
import { DrawableContextColor, FunctionGraph } from ".";
import { createFunctionsStorageContext } from "./createFunctionsStorageContext";

export interface FunctionData {
  func: string;
  color?: DrawableContextColor;
}

export interface FunctionsStorageContext {
  readonly state: Dict<FunctionData>;
  updateFunctionRecord(id: string, data: Partial<FunctionData>): void;
  removeFunctionRecord(id: string): void;
  onUpdate(cb: (state: Dict<FunctionData>) => void): () => void;
  nextId(): string;
}

export const FunctionsStorageContext = React.createContext<
  FunctionsStorageContext
>(createFunctionsStorageContext());

export interface FunctionsStorageProps {
  children: React.ReactNode;
  defaultData?: Dict<FunctionData>;
  localStorageKey?: string;
}
export const FunctionsStorage = (props: FunctionsStorageProps) => {
  const {
    children,
    defaultData,
    localStorageKey,
  } = props;
  const context = createFunctionsStorageContext(defaultData, localStorageKey);
  return (
    <FunctionsStorageContext.Provider value={context}>
      {children}
    </FunctionsStorageContext.Provider>
  );
};

export function FunctionGraphsFromStorage() {
  const context = useContext(FunctionsStorageContext);
  const [state, setState] = useState(context.state);
  useEffect(() => {
    return context.onUpdate(setState);
  }, [context]);
  return Object.entries(state).map(([id, data]) => {
    try {
      const func = new Function(`with (Math) { return (${data!.func}); }`)();
      if (typeof func === "function") {
        return <FunctionGraph key={id} color={data!.color} func={func} />;
      }
    } catch { /* empty */ }
    return null;
  });
}

function FunctionInputs() {
  const context = useContext(FunctionsStorageContext);
  const [state, setState] = useState(context.state);
  useEffect(() => {
    return context.onUpdate(setState);
  }, [context]);
  const inputs = Object.keys(state).map((id) => {
    const onEdit: React.FormEventHandler<HTMLInputElement> = (ev) => {
      const el = ev.target as HTMLInputElement;
      context.updateFunctionRecord(id, { func: el.value });
    };
    const onColorChange: React.FormEventHandler<HTMLInputElement> = (ev) => {
      const el = ev.target as HTMLInputElement;
      context.updateFunctionRecord(id, { color: el.value });
    };
    return (
      <div key={id} className="function-input-form">
        <input type="text" onInput={onEdit} value={state[id]!.func} />
        <input
          type="color"
          onInput={onColorChange}
          value={state[id]!.color as string || undefined}
        />
        <button onClick={context.removeFunctionRecord.bind(null, id)}>-</button>
      </div>
    );
  });
  const addInput = () => {
    context.updateFunctionRecord(context.nextId(), { func: "" });
  };
  return (
    <div className="function-inputs">
      {inputs}
      <button onClick={addInput}>+</button>
    </div>
  );
}

export default FunctionInputs;
