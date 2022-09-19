import { lambertW, ssrt } from 'kamikoto00lib';
import './App.css';
import FunctionGraph from './GraphDrawer/FunctionGraph';
import GraphGrid from './GraphDrawer/GraphGrid';
import GraphGridLabels from './GraphDrawer/GraphGridLabels';
import SmartGraphDrawer from './GraphDrawer/SmartGraphDrawer';

function App() {
  return (
    <div className="App">
      <SmartGraphDrawer
        width={640}
        height={480}
        focus={[0, 0]}
        scale={[10, 10]}
        animationTime={0.1}
      >
        <FunctionGraph function={(x) => Math.sin(x)} color="blue" />
        <FunctionGraph function={(x) => x * Math.exp(x)} color="red" />
        <FunctionGraph function={(x) => ssrt(x)} color="green" />
        <FunctionGraph function={(x) => lambertW(x)} color="cyan" />
        <FunctionGraph function={(x) => [Math.sqrt(x), -Math.sqrt(x)]} color="orange" />
        <GraphGrid />
        <GraphGridLabels />
      </SmartGraphDrawer>
    </div>
  );
}

export default App;
