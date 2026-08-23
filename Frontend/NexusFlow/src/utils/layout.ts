import dagre from 'dagre';
import { type Node, type Edge, Position } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 120;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 60, // Spacing between nodes in the same rank
    ranksep: 100 // Spacing between ranks
  });

  nodes.forEach((node) => {
    // Use the dynamically measured dimensions from React Flow if available
    const w = node.measured?.width ?? nodeWidth;
    const h = node.measured?.height ?? nodeHeight;
    dagreGraph.setNode(node.id, { width: w, height: h });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const w = node.measured?.width ?? nodeWidth;
    const h = node.measured?.height ?? nodeHeight;
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - w / 2,
        y: nodeWithPosition.y - h / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};
