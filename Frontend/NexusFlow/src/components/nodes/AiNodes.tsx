import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode, { type BaseNodeData } from './BaseNode';

const iconProps = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const LlmIcon = (
  <svg {...iconProps}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

type AiNode = Node<BaseNodeData, string>;

export const LlmGenerateNode = memo(function LlmGenerateNode({ id, data }: NodeProps<AiNode>) {
  return (
    <BaseNode
      id={id}
      category="ai"
      categoryLabel="AI/LLM"
      icon={LlmIcon}
      label={data.label}
      description={data.description}
      hasTarget
      hasSource
    />
  );
});
