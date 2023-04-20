import './App.css';
import AlwaysUpdate from './GraphDrawer/AlwaysUpdate';
import AutoSize from './GraphDrawer/AutoSize';
import FunctionGraph from './GraphDrawer/FunctionGraph';
import GraphDrawer from './GraphDrawer/GraphDrawer';
import GraphGrid from './GraphDrawer/GraphGrid';
import GraphGridLabels from './GraphDrawer/GraphGridLabels';
import MouseControl from './GraphDrawer/MouseControl';
import PolarGraph from './GraphDrawer/PolarGraph';
import TouchscreenControl from './GraphDrawer/TouchscreenControl';
import WheelControl from './GraphDrawer/WheelControl';

function App() {
  return (
    <div className="App">
      <GraphDrawer size={[720, 480]} defaultFocus={[0, 0]} defaultScale={[5, 5]} className="canvas">
        <PolarGraph function={(fi) => 1} color="red" />
        <GraphGrid />
        <GraphGridLabels />
        <MouseControl />
        <WheelControl wheelSpeed="3" />
        <TouchscreenControl />
        <AlwaysUpdate />
        <AutoSize />
      </GraphDrawer>
    </div>
  );
}

export default App;
