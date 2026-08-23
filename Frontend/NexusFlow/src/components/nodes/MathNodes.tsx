import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode, { type BaseNodeData } from './BaseNode';

/* ===== SVG Icons ===== */
const iconProps = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const AddIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const MultiplyIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const AverageIcon = (
  <svg {...iconProps}>
    <line x1="4" y1="20" x2="20" y2="4" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="12" cy="18" r="2" />
  </svg>
);

const CompareIcon = (
  <svg {...iconProps}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

/* ===== Math Operation Nodes ===== */
type MathNode = Node<BaseNodeData, string>;

export const AddNode = memo(function AddNode({ id, data }: NodeProps<MathNode>) {
  return (
    <BaseNode
      id={id}
      category="math"
      categoryLabel="Math"
      icon={AddIcon}
      label={data.label}
      description={data.description}
      targetHandles={[
        { id: 'input-a', label: 'A' },
        { id: 'input-b', label: 'B' },
      ]}
      hasSource
    />
  );
});

export const MultiplyNode = memo(function MultiplyNode({ id, data }: NodeProps<MathNode>) {
  return (
    <BaseNode
      id={id}
      category="math"
      categoryLabel="Math"
      icon={MultiplyIcon}
      label={data.label}
      description={data.description}
      targetHandles={[
        { id: 'input-a', label: 'A' },
        { id: 'input-b', label: 'B' },
      ]}
      hasSource
    />
  );
});

export const AverageNode = memo(function AverageNode({ id, data }: NodeProps<MathNode>) {
  return (
    <BaseNode
      id={id}
      category="math"
      categoryLabel="Math"
      icon={AverageIcon}
      label={data.label}
      description={data.description}
      hasTarget
      hasSource
    />
  );
});

export const CompareNode = memo(function CompareNode({ id, data }: NodeProps<MathNode>) {
  return (
    <BaseNode
      id={id}
      category="math"
      categoryLabel="Math"
      icon={CompareIcon}
      label={data.label}
      description={data.description}
      targetHandles={[
        { id: 'input-a', label: 'A' },
        { id: 'input-b', label: 'B' },
      ]}
      sourceHandles={[
        { id: 'true', label: 'True' },
        { id: 'false', label: 'False' },
      ]}
    />
  );
});
