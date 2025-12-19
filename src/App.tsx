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
  FunctionsStorageAuto,
} from "./FunctionInputs";

function App() {
  return (
    <div className="App">
      <FunctionsStorageAuto>
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
      </FunctionsStorageAuto>
    </div>
  );
}

export default App;
