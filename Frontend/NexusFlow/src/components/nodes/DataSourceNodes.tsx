import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode, { type BaseNodeData } from './BaseNode';

/* ===== SVG Icons ===== */
const iconProps = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const TurbineIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 10 10" />
    <path d="M12 2a10 10 0 0 0-10 10" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="9" x2="12" y2="2" />
    <line x1="12" y1="15" x2="12" y2="22" />
    <line x1="9" y1="12" x2="2" y2="12" />
    <line x1="15" y1="12" x2="22" y2="12" />
  </svg>
);

const TempIcon = (
  <svg {...iconProps}>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </svg>
);

const PressureIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 16 16 12 12 8" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

/* ===== Node Types ===== */
type DataSourceNode = Node<BaseNodeData, string>;

export const TurbineSensorNode = memo(function TurbineSensorNode({ id, data }: NodeProps<DataSourceNode>) {
  return (
    <BaseNode
      id={id}
      category="data-source"
      categoryLabel="Telemetry"
      icon={TurbineIcon}
      label={data.label}
      description={data.description}
      hasSource
    />
  );
});

export const TempSensorNode = memo(function TempSensorNode({ id, data }: NodeProps<DataSourceNode>) {
  return (
    <BaseNode
      id={id}
      category="data-source"
      categoryLabel="Telemetry"
      icon={TempIcon}
      label={data.label}
      description={data.description}
      hasSource
    />
  );
});

export const PressureSensorNode = memo(function PressureSensorNode({ id, data }: NodeProps<DataSourceNode>) {
  return (
    <BaseNode
      id={id}
      category="data-source"
      categoryLabel="Telemetry"
      icon={PressureIcon}
      label={data.label}
      description={data.description}
      hasSource
    />
  );
});
