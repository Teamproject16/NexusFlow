import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode, { type BaseNodeData } from './BaseNode';

/* ===== SVG Icons ===== */
const iconProps = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const SmsIcon = (
  <svg {...iconProps}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const EmailIcon = (
  <svg {...iconProps}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const WebhookIcon = (
  <svg {...iconProps}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

/* ===== Action Trigger Nodes ===== */
type ActionNode = Node<BaseNodeData, string>;

export const SmsActionNode = memo(function SmsActionNode({ id, data }: NodeProps<ActionNode>) {
  return (
    <BaseNode
      id={id}
      category="action"
      categoryLabel="Action"
      icon={SmsIcon}
      label={data.label}
      description={data.description}
      hasTarget
    />
  );
});

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
