import React, { useContext, useLayoutEffect, useRef } from "react";
import "./FunctionInputs.css";
import { FunctionGraph, num2color, tryColor2num, useUpdate } from ".";
import { FunctionsStorage, FunctionsStorageContext } from "./FunctionsStorageContext";
import { GraphDrawerDataLoader, type GraphDrawerData } from "./GraphDrawerDataLoader";

export interface FunctionsStorageProps {
  children: React.ReactNode;
}

export const FunctionsStorageAuto = (props: FunctionsStorageProps) => {
  const {
    children,
  } = props;
  const context = useRef(new FunctionsStorage());
  useLayoutEffect(() => {
    let dataSrc: GraphDrawerData | Promise<GraphDrawerData> | undefined;
    try {
      dataSrc = GraphDrawerDataLoader.getAuto();
    } catch (e) {
      console.error(e);
    }
    if (dataSrc instanceof Promise) {
      dataSrc.then(data => {
        GraphDrawerDataLoader.data2context(data, context.current);
        GraphDrawerDataLoader.setContextSave(context.current);
      });
    } else if (dataSrc) {
      GraphDrawerDataLoader.data2context(dataSrc, context.current);
      GraphDrawerDataLoader.setContextSave(context.current);
    } else {
      const data: GraphDrawerData = {
        version: 1,
        functions: [
          {
            src: "x => x * x",
            color: 0xff0000,
          }
        ],
      };
      GraphDrawerDataLoader.data2context(data, context.current);
      context.current.triggerUpdate();
      const unsub = context.current.onUpdate((ctx) => {
        unsub();
        const data = GraphDrawerDataLoader.context2data(ctx);
        GraphDrawerDataLoader.writeUrl(data);
        GraphDrawerDataLoader.setContextSave(ctx);
      });
      return unsub;
    }
    context.current.triggerUpdate();
  }, []);
  return (
    <FunctionsStorageContext.Provider value={context.current}>
      {children}
    </FunctionsStorageContext.Provider>
  );
};

export function FunctionGraphsFromStorage() {
  const context = useContext(FunctionsStorageContext);
  const update = useUpdate();
  useLayoutEffect(() => {
    const removeUpdate = context.onUpdate(update);
    return () => {
      removeUpdate();
    };
  }, []);
  return Object.entries(context.state).map(([id, data]) => {
    try {
      const func = new Function(`with(Math){return x=>{try{return(${data.func})(x)}catch{}}}`)();
      if (typeof func === "function") {
        return <FunctionGraph key={id} color={num2color(data.color)} func={func} />;
      }
    } catch { }
    return null;
  });
}

function FunctionInputs() {
  const context = useContext(FunctionsStorageContext);
  const update = useUpdate();
  useLayoutEffect(() => {
    const removeUpdate = context.onUpdate(update);
    return () => {
      removeUpdate();
    };
  }, []);
  const inputs = Object.keys(context.state).map((id) => {
    const onEdit: React.FormEventHandler<HTMLInputElement> = (ev) => {
      const el = ev.target as HTMLInputElement;
      context.updateFunctionRecord(id, { func: el.value });
    };
    const onColorChange: React.FormEventHandler<HTMLInputElement> = (ev) => {
      const el = ev.target as HTMLInputElement;
      context.updateFunctionRecord(id, { color: tryColor2num(el.value) });
    };
    return (
      <div key={id} className="function-input-form">
        <input type="text" onInput={onEdit} value={context.state[id].func} />
        <input
          type="color"
          onInput={onColorChange}
          value={num2color(context.state[id].color)}
        />
        <button onClick={context.removeFunctionRecord.bind(context, id)}>-</button>
      </div>
    );
  });
  const addInput = () => {
    context.updateFunctionRecord(context.nextId(), {});
  };
  return (
    <div className="function-inputs">
      {inputs}
      <button onClick={addInput}>+</button>
    </div>
  );
}

export default FunctionInputs;
