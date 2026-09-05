import { useState, useCallback, useRef, useMemo, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  ConnectionLineType,
  MarkerType,
  type Connection,
  type Node,
  type Edge,
  getOutgoers,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '../nodes/nodeTypes';
import GlowingEdge from './GlowingEdge';
import CanvasToolbar from '../Toolbar/CanvasToolbar';
import ContextMenu from './ContextMenu';
import AlertsPanel from './AlertsPanel';
import NodeInspectorModal from '../Inspector/NodeInspectorModal';
import LiveDashboard from '../Dashboard/LiveDashboard';
import { getLayoutedElements } from '../../utils/layout';
import { runWorkflow, type NodeStatus } from '../../utils/engine';
import { deployGraph, ingestTelemetry } from '../../utils/api';
import { useBackendSocket } from '../../hooks/useBackendSocket';
import './FlowCanvas.css';

/* ===== Edge Types ===== */
const edgeTypes = {
  glowing: GlowingEdge,
};

/* ===== Initial Seed Data (IoT Pipeline) ===== */
const initialNodes: Node[] = [
  {
    id: 'sensor-1',
    type: 'sensorTurbine',
    position: { x: 100, y: 150 },
    data: { label: 'Turbine Sensor', description: 'Vibration & RPM', sensorId: 'sensor-1' },
  },
  {
    id: 'filter-1',
    type: 'filterMovingAverage',
    position: { x: 450, y: 150 },
    data: { label: 'Moving Average', description: 'Smooth noisy telemetry', windowSize: 5 },
  },
  {
    id: 'filter-2',
    type: 'filterThreshold',
    position: { x: 750, y: 150 },
    data: { label: 'Threshold Check', description: 'Branch if value > 75', operator: '>', threshold: 75 },
  },
  {
    id: 'action-1',
    type: 'actionWebhook',
    position: { x: 1050, y: 100 },
    data: { label: 'Outbound Webhook', description: 'HTTP POST webhook', webhookUrl: 'http://127.0.0.1:3000/api/webhook-test' },
  },
  {
    id: 'action-2',
    type: 'actionSms',
    position: { x: 1050, y: 220 },
    data: { label: 'SMS Alert', description: 'Twilio SMS Notification', phoneNumber: '+1-555-0199' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-1-2',
    source: 'sensor-1',
    target: 'filter-1',
    animated: true,
    type: 'glowing',
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
    style: { stroke: '#10b981', strokeWidth: 2 },
  },
  {
    id: 'e-2-3',
    source: 'filter-1',
    target: 'filter-2',
    animated: true,
    type: 'glowing',
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
    style: { stroke: '#f59e0b', strokeWidth: 2 },
  },
  {
    id: 'e-3-4',
    source: 'filter-2',
    target: 'action-1',
    animated: true,
    type: 'glowing',
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
    style: { stroke: '#f97316', strokeWidth: 2 },
  },
  {
    id: 'e-3-5',
    source: 'filter-2',
    target: 'action-2',
    animated: true,
    type: 'glowing',
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
    style: { stroke: '#ea580c', strokeWidth: 2 },
  },
];

/* ===== Node ID Counter ===== */
let nodeIdCounter = 10;
function getNextNodeId() {
  return `node-${nodeIdCounter++}`;
}

/* ===== Default labels per node type ===== */
const defaultNodeData: Record<string, { label: string; description: string; [key: string]: any }> = {
  sensorTurbine: { label: 'Turbine Sensor', description: 'Vibration & RPM', sensorId: 'sensor-1' },
  sensorTemp: { label: 'Temperature Sensor', description: 'Heat & Thermal Data', sensorId: 'sensor-2' },
  sensorPressure: { label: 'Pressure Sensor', description: 'Fluid & Gas PSI', sensorId: 'sensor-3' },
  filterMovingAverage: { label: 'Moving Average', description: 'Smooth noisy telemetry', windowSize: 5 },
  filterThreshold: { label: 'Threshold Check', description: 'Branch if value > X', operator: '>', threshold: 80 },
  filterMerge: { label: 'Data Merge', description: 'Combine data streams' },
  actionSms: { label: 'SMS Alert', description: 'Send text notification', phoneNumber: '+1-555-0199' },
  actionEmail: { label: 'Email Alert', description: 'Send email alert', email: 'ops-lead@nexusflow.io' },
  actionWebhook: { label: 'Webhook Trigger', description: 'Trigger external API', webhookUrl: 'http://127.0.0.1:3000/api/webhook-test' },
};

/* ===== FlowCanvas Component ===== */
function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow();
  const { screenToFlowPosition, fitView, updateNodeData } = reactFlowInstance;
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const {
    isConnected,
    alerts,
    liveTelemetry,
    outboundHistory,
    activeEdgePulses,
    sendTelemetry,
    clearAlerts,
  } = useBackendSocket();

  /* --- Glowing Edges: Dynamically inject glow state based on activeEdgePulses --- */
  const displayEdges = useMemo(() => {
    return edges.map((edge) => {
      const isPulsing = Boolean(
        activeEdgePulses[edge.id] || activeEdgePulses[`${edge.source}-${edge.target}`]
      );
      const targetNode = nodes.find((n) => n.id === edge.target);
      const category = targetNode?.type?.startsWith('action')
        ? 'action'
        : targetNode?.type?.startsWith('sensor')
        ? 'sensor'
        : 'filter';

      return {
        ...edge,
        type: 'glowing',
        data: {
          ...(edge.data || {}),
          isActive: isPulsing,
          category,
        },
      };
    });
  }, [edges, activeEdgePulses, nodes]);

  /* --- Connection handler --- */
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        animated: true,
        type: 'glowing',
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
        style: { stroke: 'var(--accent)', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  /* --- Validation handler (prevent cycles & self-connection) --- */
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      if (connection.source === connection.target) return false;

      const targetNode = nodes.find((node) => node.id === connection.target);
      if (!targetNode) return false;

      const hasCycle = (node: Node, visited = new Set<string>()) => {
        if (visited.has(node.id)) return false;
        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
        return false;
      };

      if (hasCycle(targetNode)) return false;

      return true;
    },
    [nodes, edges]
  );

  /* --- Drag-over handler (allow drop) --- */
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /* --- Drop handler (create node) --- */
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const defaults = defaultNodeData[nodeType] || { label: 'New Node', description: '' };

      const newNode: Node = {
        id: getNextNodeId(),
        type: nodeType,
        position,
        data: { ...defaults },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  /* --- Deploy to Backend handler --- */
  const onDeploy = useCallback(async () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployStatus('idle');
    try {
      const flow = reactFlowInstance.toObject();
      await deployGraph(flow);
      setDeployStatus('success');
      setTimeout(() => setDeployStatus('idle'), 3000);
    } catch (err) {
      console.error('Deploy failed:', err);
      setDeployStatus('error');
      setTimeout(() => setDeployStatus('idle'), 3000);
    } finally {
      setIsDeploying(false);
    }
  }, [isDeploying, reactFlowInstance]);

  /* --- Simulate Telemetry handler (WebSocket + REST) --- */
  const simulateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onToggleSimulate = useCallback(() => {
    setIsAlertsOpen(true);
    if (isSimulating) {
      if (simulateRef.current) clearInterval(simulateRef.current);
      simulateRef.current = null;
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      simulateRef.current = setInterval(() => {
        const sensorTypes = ['sensorTurbine', 'sensorTemp', 'sensorPressure'];
        const type = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
        const val = Math.floor(40 + Math.random() * 85);

        // High-velocity stream directly through WebSocket
        sendTelemetry({
          sensorId: 'sensor-1',
          sensorType: type,
          value: val,
        });

        // Also backfill REST occasionally
        if (Math.random() > 0.6) {
          ingestTelemetry({
            sensorId: 'sensor-1',
            sensorType: type,
            value: val,
            metadata: { location: 'Turbine Bay Alpha' },
          }).catch(() => {});
        }
      }, 750);
    }
  }, [isSimulating, sendTelemetry]);

  /* --- Reset handler --- */
  const onReset = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  /* --- Node Click / Double Click Inspector handler --- */
  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  /* --- Context Menu handlers --- */
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if (!pane) return;
      setMenu({
        id: node.id,
        top: event.clientY - pane.top,
        left: event.clientX - pane.left,
      });
    },
    [setMenu]
  );

  const onConfigureFromMenu = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedNode(node);
      }
    },
    [nodes]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const handleSaveNodeConfig = useCallback(
    (nodeId: string, updatedData: Record<string, unknown>) => {
      updateNodeData(nodeId, updatedData);
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...updatedData } } : n))
      );
    },
    [updateNodeData, setNodes]
  );

  /* --- Layout handler --- */
  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      'LR'
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);

    window.requestAnimationFrame(() => {
      fitView({ duration: 800, padding: 0.2 });
    });
  }, [nodes, edges, setNodes, setEdges, fitView]);

  /* --- Run Workflow handler (local simulator) --- */
  const onRun = useCallback(async () => {
    if (isRunning) return;
    setIsAlertsOpen(true);
    setIsRunning(true);

    const updateStatus = (nodeId: string, status: NodeStatus) => {
      updateNodeData(nodeId, { status });
    };

    await runWorkflow(nodes, edges, updateStatus, 800);

    setIsRunning(false);
  }, [isRunning, nodes, edges, updateNodeData]);

  /* --- Save / Restore handlers --- */
  const onSave = useCallback(() => {
    const flow = reactFlowInstance.toObject();
    localStorage.setItem('nexusflow-save', JSON.stringify(flow));
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const flowString = localStorage.getItem('nexusflow-save');
    if (flowString) {
      try {
        const flow = JSON.parse(flowString);
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        if (flow.viewport) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport;
          reactFlowInstance.setViewport({ x, y, zoom });
        }
      } catch (err) {
        console.error('Failed to restore canvas', err);
      }
    }
  }, [setNodes, setEdges, reactFlowInstance]);

  /* --- Export / Import handlers --- */
  const onExport = useCallback(() => {
    const flow = reactFlowInstance.toObject();
    const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexusflow-workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [reactFlowInstance]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target?.result as string);
          if (flow) {
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            if (flow.viewport) {
              const { x = 0, y = 0, zoom = 1 } = flow.viewport;
              reactFlowInstance.setViewport({ x, y, zoom });
            }
          }
        } catch (err) {
          console.error('Failed to import workflow', err);
          alert('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [setNodes, setEdges, reactFlowInstance]
  );

  /* --- MiniMap node color by category --- */
  const getNodeColor = useCallback((node: Node) => {
    const type = node.type || '';
    if (type.includes('sensor')) return '#10b981';
    if (type.includes('filter')) return '#f59e0b';
    if (type.includes('action')) return '#f97316';
    return '#6b7280';
  }, []);

  return (
    <div className="flow-canvas" ref={reactFlowWrapper} id="flow-canvas">
      {isDashboardOpen ? (
        <LiveDashboard
          liveTelemetry={liveTelemetry}
          alerts={alerts}
          outboundHistory={outboundHistory}
          isConnected={isConnected}
          onSendTelemetry={sendTelemetry}
          onBackToCanvas={() => setIsDashboardOpen(false)}
        />
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeContextMenu={onNodeContextMenu}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={{ stroke: 'var(--accent-glow)', strokeWidth: 2 }}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          defaultEdgeOptions={{
            animated: true,
            type: 'glowing',
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255, 255, 255, 0.05)"
          />
          <Controls
            className="flow-controls"
            showInteractive={false}
            position="bottom-left"
          />
          <MiniMap
            className="flow-minimap"
            nodeColor={getNodeColor}
            maskColor="rgba(12, 13, 17, 0.75)"
            style={{
              backgroundColor: 'rgba(18, 20, 26, 0.95)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            pannable
            zoomable
          />
          <CanvasToolbar
            onReset={onReset}
            onSave={onSave}
            onRestore={onRestore}
            onExport={onExport}
            onImport={onImport}
            onLayout={onLayout}
            onRun={onRun}
            isRunning={isRunning}
            onDeploy={onDeploy}
            isDeploying={isDeploying}
            deployStatus={deployStatus}
            onToggleSimulate={onToggleSimulate}
            isSimulating={isSimulating}
            isConnected={isConnected}
            onOpenDashboard={() => setIsDashboardOpen((prev) => !prev)}
            isDashboardOpen={isDashboardOpen}
            onToggleAlerts={() => setIsAlertsOpen((prev) => !prev)}
            isAlertsOpen={isAlertsOpen}
            alertsCount={alerts.length}
          />
          {isAlertsOpen && (
            <AlertsPanel alerts={alerts} isConnected={isConnected} onClear={clearAlerts} />
          )}
          {menu && (
            <ContextMenu
              onClick={onPaneClick}
              onConfigure={onConfigureFromMenu}
              {...menu}
            />
          )}
        </ReactFlow>
      )}

      {/* Node Inspector Drawer */}
      <NodeInspectorModal
        node={selectedNode}
        isOpen={Boolean(selectedNode)}
        onClose={() => setSelectedNode(null)}
        onSave={handleSaveNodeConfig}
      />

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileImport}
      />
    </div>
  );
}

export default FlowCanvas;

