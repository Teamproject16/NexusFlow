import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode, { type BaseNodeData } from './BaseNode';

/* ===== SVG Icons ===== */
const iconProps = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const FilterIcon = (
  <svg {...iconProps}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ThresholdIcon = (
  <svg {...iconProps}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const MergeIcon = (
  <svg {...iconProps}>
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

/* ===== Math/Filter Operation Nodes ===== */
type MathNode = Node<BaseNodeData, string>;

export const MovingAverageNode = memo(function MovingAverageNode({ id, data }: NodeProps<MathNode>) {
  return (
    <BaseNode
      id={id}
      category="math"
      categoryLabel="Filter"
      icon={FilterIcon}
      label={data.label}
      description={data.description}
      hasTarget
      hasSource
    />
  );
});

export const ThresholdNode = memo(function ThresholdNode({ id, data }: NodeProps<MathNode>) {
  return (
    <BaseNode
      id={id}
      category="math"
      categoryLabel="Filter"
      icon={ThresholdIcon}
      label={data.label}
      description={data.description}
      hasTarget
      sourceHandles={[
        { id: 'true', label: 'True' },
        { id: 'false', label: 'False' },
      ]}
    />
  );
});

export const DataMergeNode = memo(function DataMergeNode({ id, data }: NodeProps<MathNode>) {
  return (
    <BaseNode
      id={id}
      category="math"
      categoryLabel="Filter"
      icon={MergeIcon}
      label={data.label}
      description={data.description}
      targetHandles={[
        { id: 'input-1', label: 'Data 1' },
        { id: 'input-2', label: 'Data 2' },
      ]}
      hasSource
    />
  );
});
