import {
  AutoSize,
  GraphDrawer,
  GraphGrid,
  GraphGridLabels,
  MouseControl,
  TouchscreenControl,
  WheelControl,
} from ".";
import "./App.css";
import FunctionInputs, {
  FunctionGraphsFromStorage,
  FunctionsStorage,
} from "./FunctionInputs";

const defaultData = {
  0: { func: "x => sin(x)", color: "#ff0000" },
  1: { func: "x => x", color: "#000000" },
};

function App() {
  return (
    <div className="App">
      <FunctionsStorage
        defaultData={defaultData}
        localStorageKey="functions data"
      >
        <GraphDrawer
          size={[300, 100]}
          focus={[0, 0]}
          scale={[5, 5]}
          className="canvas"
        >
          <FunctionGraphsFromStorage />
          <GraphGrid />
          <GraphGridLabels />
          <MouseControl />
          <WheelControl wheelSpeed="3" />
          <TouchscreenControl />
          <AutoSize />
        </GraphDrawer>
        <FunctionInputs />
      </FunctionsStorage>
    </div>
  );
}

export default App;
