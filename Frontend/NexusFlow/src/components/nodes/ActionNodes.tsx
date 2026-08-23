import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode, { type BaseNodeData } from './BaseNode';

/* ===== SVG Icons ===== */
const iconProps = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const EmailIcon = (
  <svg {...iconProps}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const WebhookIcon = (
  <svg {...iconProps}>
    <path d="M18 16.98h-5.99c-1.66 0-3.01-1.34-3.01-3L9 7" />
    <path d="M15 13l3 3.98-3 4.02" />
    <path d="M6 7.98h5.99c1.66 0 3.01 1.34 3.01 3L15 17" />
    <path d="M9 11L6 7.02 9 3" />
  </svg>
);

const LogIcon = (
  <svg {...iconProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SaveIcon = (
  <svg {...iconProps}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

/* ===== Action Trigger Nodes ===== */
type ActionNode = Node<BaseNodeData, string>;

export const EmailActionNode = memo(function EmailActionNode({ id, data }: NodeProps<ActionNode>) {
  return (
    <BaseNode
      id={id}
      category="action"
      categoryLabel="Action"
      icon={EmailIcon}
      label={data.label}
      description={data.description}
      hasTarget
    />
  );
});

export const WebhookActionNode = memo(function WebhookActionNode({ id, data }: NodeProps<ActionNode>) {
  return (
    <BaseNode
      id={id}
      category="action"
      categoryLabel="Action"
      icon={WebhookIcon}
      label={data.label}
      description={data.description}
      hasTarget
    />
  );
});

export const LogActionNode = memo(function LogActionNode({ id, data }: NodeProps<ActionNode>) {
  return (
    <BaseNode
      id={id}
      category="action"
      categoryLabel="Action"
      icon={LogIcon}
      label={data.label}
      description={data.description}
      hasTarget
    />
  );
});

export const SaveActionNode = memo(function SaveActionNode({ id, data }: NodeProps<ActionNode>) {
  return (
    <BaseNode
      id={id}
      category="action"
      categoryLabel="Action"
      icon={SaveIcon}
      label={data.label}
      description={data.description}
      hasTarget
    />
  );
});
