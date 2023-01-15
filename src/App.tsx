import { clamp, random } from 'kamikoto00lib';
import { useCallback } from 'react';
import './App.css';
import AlwaysUpdate from './GraphDrawer/AlwaysUpdate';
import FocusTarget from './GraphDrawer/FocusTarget';
import FunctionGraph from './GraphDrawer/FunctionGraph';
import GraphDrawer from './GraphDrawer/GraphDrawer';
import GraphGrid from './GraphDrawer/GraphGrid';
import GraphGridLabels from './GraphDrawer/GraphGridLabels';
import LineGraphByTwoFunctions from './GraphDrawer/LineGraphByTwoFunctions';
import MouseMoveControl from './GraphDrawer/MouseMoveControl';
import PolarGraph from './GraphDrawer/PolarGraph';
import ScaleTarget from './GraphDrawer/ScaleTarget';
import TouchscreenControl from './GraphDrawer/TouchscreenControl';
import WheelControl from './GraphDrawer/WheelControl';

/*
<FunctionGraph function={(x) => random.array.of(`int:${-x}-${x}`, clamp(1, Math.abs(x), 3))} color="#0000ff80" />
<PolarGraph function={(fi) => Math.sin(fi * 1.02)} color="red" fiStep={Math.PI/360} fiEnd={Math.PI * 100} />
*/


function App() {
  const func = useCallback((m: number) => (x: number) => ((x / m) ** 0.5), []);
  return (
    <div className="App">
      <GraphDrawer
        width="720"
        height="480"
        defaultFocus={[0, 0]}
        defaultScale={[10, 10]}
      >
        <FunctionGraph function={func(100)} color="blue" />
        <LineGraphByTwoFunctions
          tStart={0}
          tEnd={4}
          tStep={1}
          x={t => (t & 1 ^ ((t & 2) / 2)) * 100}
          y={(t => (t & 2) / 2)}
          color="red" />
        <GraphGrid />
        <GraphGridLabels />
        <MouseMoveControl />
        <WheelControl wheelSpeed="3" />
        <TouchscreenControl />
        <ScaleTarget value={[100, 1]}/>
        <FocusTarget value={[50, 0.5]} />
      </GraphDrawer>
    </div>
  );
}

export default App;
