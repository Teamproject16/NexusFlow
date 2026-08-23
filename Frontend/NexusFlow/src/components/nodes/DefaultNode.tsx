import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

type DefaultNodeData = {
  label: string;
};

type DefaultNodeType = Node<DefaultNodeData, 'process'>;

function DefaultNode({ data }: NodeProps<DefaultNodeType>) {
  return (
    <div className="custom-node custom-node--process">
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle custom-handle--target"
        id="target"
      />
      <div className="custom-node__header custom-node__header--process">
        <div className="custom-node__icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <span className="custom-node__type">Process</span>
      </div>
      <div className="custom-node__body">
        <span className="custom-node__label">{data.label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle custom-handle--source"
        id="source"
      />
    </div>
  );
}

export default memo(DefaultNode);
