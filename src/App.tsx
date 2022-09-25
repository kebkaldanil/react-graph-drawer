import './App.css';
import FunctionGraph from './GraphDrawer/FunctionGraph';
import GraphDrawer from './GraphDrawer/GraphDrawer';
import GraphGrid from './GraphDrawer/GraphGrid';
import GraphGridLabels from './GraphDrawer/GraphGridLabels';
import MouseMoveControl from './GraphDrawer/MouseMoveControl';
import ScaleTarget from './GraphDrawer/ScaleTarget';
import TouchscreenControl from './GraphDrawer/TouchscreenControl';
import WheelControl from './GraphDrawer/WheelControl';

function App() {
  return (
    <div className="App">
      <GraphDrawer
        size={[640, 480]}
        defaultFocus={[0, 0]}
        defaultScale={[10, 10]}
      >
        <FunctionGraph function={(x) => x} color="#0f8" />
        <FunctionGraph function={(x) => {const y = Math.sqrt(1-x*x);return[y, -y];}} color="red" />
        <GraphGrid />
        <GraphGridLabels />
        <MouseMoveControl />
        <WheelControl />
        <TouchscreenControl />
        <ScaleTarget value={[10, 10]} animationTime={1} />
      </GraphDrawer>
    </div>
  );
}

export default App;
