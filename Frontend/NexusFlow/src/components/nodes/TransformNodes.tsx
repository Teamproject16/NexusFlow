import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode, { type BaseNodeData } from './BaseNode';

const iconProps = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const FilterIcon = (
  <svg {...iconProps}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const TransformIcon = (
  <svg {...iconProps}>
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);

type TransformNode = Node<BaseNodeData, string>;

export const FilterNode = memo(function FilterNode({ id, data }: NodeProps<TransformNode>) {
  return (
    <BaseNode
      id={id}
      category="transform"
      categoryLabel="Transform"
      icon={FilterIcon}
      label={data.label}
      description={data.description}
      hasTarget
      hasSource
    />
  );
});

export const MapNode = memo(function MapNode({ id, data }: NodeProps<TransformNode>) {
  return (
    <BaseNode
      id={id}
      category="transform"
      categoryLabel="Transform"
      icon={TransformIcon}
      label={data.label}
      description={data.description}
      hasTarget
      hasSource
    />
  );
});
