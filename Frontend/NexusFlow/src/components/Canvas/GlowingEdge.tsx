import { memo } from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import './GlowingEdge.css';

export interface GlowingEdgeData extends Record<string, unknown> {
  isActive?: boolean;
  value?: number;
  category?: 'sensor' | 'filter' | 'action';
}

function GlowingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const edgeData = (data as GlowingEdgeData) || {};
  const isActive = Boolean(edgeData.isActive);
  const category = edgeData.category || 'filter';

  // Neon glow color according to category (Industrial Ember & Cyber Emerald)
  let glowColor = 'rgba(245, 158, 11, 0.95)'; // Ember gold default
  if (category === 'sensor') glowColor = 'rgba(16, 185, 129, 0.95)'; // Cyber emerald
  if (category === 'action') glowColor = 'rgba(249, 115, 22, 0.95)'; // Molten orange

  const edgeClass = `glowing-edge ${isActive ? 'glowing-edge--active' : 'glowing-edge--idle'} glowing-edge--${category}`;

  return (
    <g className={edgeClass} id={`edge-group-${id}`}>
      {/* Outer Glow Halo (when active) */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke={glowColor}
          strokeWidth={8}
          strokeOpacity={0.4}
          className="glowing-edge__glow-path"
          style={{ filter: `blur(4px)` }}
        />
      )}

      {/* Main Base Edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isActive
            ? category === 'sensor'
              ? '#10b981'
              : category === 'action'
              ? '#f97316'
              : '#f59e0b'
            : style.stroke || '#4b5563',
          strokeWidth: isActive ? 3 : 2,
        }}
      />

      {/* Active Pulse Particle along the wire */}
      {isActive && (
        <circle r={4} fill="#ffffff" className="glowing-edge__pulse-circle">
          <animateMotion
            dur="0.8s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}
    </g>
  );
}

export default memo(GlowingEdge);
