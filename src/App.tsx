import './App.css';
import Clock from './Clock';
import AlwaysUpdate from './GraphDrawer/AlwaysUpdate';
import AutoSize from './GraphDrawer/AutoSize';
import GraphDrawer from './GraphDrawer/GraphDrawer';
import MouseControl from './GraphDrawer/MouseControl';
import TouchscreenControl from './GraphDrawer/TouchscreenControl';
import WheelControl from './GraphDrawer/WheelControl';

function App() {
  return (
    <div className="App">
      <GraphDrawer size={[720, 480]} defaultFocus={[0, 0]} defaultScale={[3, 3]} className="canvas">
        <Clock />
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
