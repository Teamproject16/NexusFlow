import { ReactFlowProvider } from '@xyflow/react';
import Sidebar from './components/Sidebar/Sidebar';
import FlowCanvas from './components/Canvas/FlowCanvas';
import './App.css';

function App() {
  return (
    <ReactFlowProvider>
      <div className="app" id="app">
        <Sidebar />
        <FlowCanvas />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
