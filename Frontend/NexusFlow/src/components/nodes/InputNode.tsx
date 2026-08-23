import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

type InputNodeData = {
  label: string;
};

type InputNodeType = Node<InputNodeData, 'input'>;

function InputNode({ data }: NodeProps<InputNodeType>) {
  return (
    <div className="custom-node custom-node--input">
      <div className="custom-node__header custom-node__header--input">
        <div className="custom-node__icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <span className="custom-node__type">Input</span>
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

export default memo(InputNode);
