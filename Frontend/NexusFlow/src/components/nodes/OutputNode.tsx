import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

type OutputNodeData = {
  label: string;
};

type OutputNodeType = Node<OutputNodeData, 'output'>;

function OutputNode({ data }: NodeProps<OutputNodeType>) {
  return (
    <div className="custom-node custom-node--output">
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle custom-handle--target"
        id="target"
      />
      <div className="custom-node__header custom-node__header--output">
        <div className="custom-node__icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <span className="custom-node__type">Output</span>
      </div>
      <div className="custom-node__body">
        <span className="custom-node__label">{data.label}</span>
      </div>
    </div>
  );
}

export default memo(OutputNode);
