import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode, { type BaseNodeData } from './BaseNode';

/* ===== SVG Icons ===== */
const iconProps = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const ApiIcon = (
  <svg {...iconProps}>
    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
  </svg>
);

const DbIcon = (
  <svg {...iconProps}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const FileIcon = (
  <svg {...iconProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const TimerIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/* ===== Data Source Nodes ===== */
type DSNode = Node<BaseNodeData, string>;

export const ApiSourceNode = memo(function ApiSourceNode({ id, data }: NodeProps<DSNode>) {
  return (
    <BaseNode
      id={id}
      category="data-source"
      categoryLabel="Data Source"
      icon={ApiIcon}
      label={data.label}
      description={data.description}
      hasSource
    />
  );
});

export const DbSourceNode = memo(function DbSourceNode({ id, data }: NodeProps<DSNode>) {
  return (
    <BaseNode
      id={id}
      category="data-source"
      categoryLabel="Data Source"
      icon={DbIcon}
      label={data.label}
      description={data.description}
      hasSource
    />
  );
});

export const FileSourceNode = memo(function FileSourceNode({ id, data }: NodeProps<DSNode>) {
  return (
    <BaseNode
      id={id}
      category="data-source"
      categoryLabel="Data Source"
      icon={FileIcon}
      label={data.label}
      description={data.description}
      hasSource
    />
  );
});

export const TimerSourceNode = memo(function TimerSourceNode({ id, data }: NodeProps<DSNode>) {
  return (
    <BaseNode
      id={id}
      category="data-source"
      categoryLabel="Data Source"
      icon={TimerIcon}
      label={data.label}
      description={data.description}
      hasSource
    />
  );
});
