import { type Node, type Edge } from '@xyflow/react';

export type NodeStatus = 'idle' | 'running' | 'completed' | 'error';

export async function runWorkflow(
  nodes: Node[],
  edges: Edge[],
  updateStatus: (nodeId: string, status: NodeStatus) => void,
  delayMs = 800
): Promise<void> {
  // 1. Reset all to idle
  nodes.forEach(n => updateStatus(n.id, 'idle'));

  // 2. Build graph for topological sort
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach(n => {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
  });

  edges.forEach(e => {
    if (adj.has(e.source) && adj.has(e.target)) {
      adj.get(e.source)!.push(e.target);
      inDegree.set(e.target, inDegree.get(e.target)! + 1);
    }
  });

  // 3. Kahn's Algorithm
  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      const deg = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, deg);
      if (deg === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== nodes.length) {
    alert('Cycle detected! Cannot run workflow.');
    return;
  }

  // 4. Execute Simulation Sequentially
  for (const nodeId of sorted) {
    updateStatus(nodeId, 'running');
    
    // Simulate work
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    updateStatus(nodeId, 'completed');
  }
}
