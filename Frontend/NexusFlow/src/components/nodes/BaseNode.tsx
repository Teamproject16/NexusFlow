import { memo, useState, useRef, useEffect, type ReactNode } from 'react';
import { Handle, Position, useReactFlow, useNodesData } from '@xyflow/react';

export type BaseNodeData = Record<string, unknown> & {
  label: string;
  description?: string;
  status?: 'idle' | 'running' | 'completed' | 'error';
};

export interface BaseNodeProps {
  /** Node ID for updating data */
  id: string;
  /** Category-specific CSS modifier (e.g. 'data-source', 'math', 'action') */
  category: string;
  /** Uppercase category label shown in the header ribbon */
  categoryLabel: string;
  /** Icon rendered in the header */
  icon: ReactNode;
  /** Node label from data */
  label: string;
  /** Optional description shown below label */
  description?: string;
  /** Whether to render a target (left) handle */
  hasTarget?: boolean;
  /** Whether to render a source (right) handle */
  hasSource?: boolean;
  /** Number of target handles (for multi-input nodes like math) */
  targetHandles?: { id: string; label: string }[];
  /** Number of source handles */
  sourceHandles?: { id: string; label: string }[];
}

function BaseNode({
  id,
  category,
  categoryLabel,
  icon,
  label,
  description,
  hasTarget = false,
  hasSource = false,
  targetHandles,
  sourceHandles,
}: BaseNodeProps) {
  const { updateNodeData } = useReactFlow();
  const nodeInfo = useNodesData(id);
  const nodeData = nodeInfo?.data as BaseNodeData | undefined;
  const status = nodeData?.status || 'idle';

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(label);
  }, [label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed !== '') {
      updateNodeData(id, { label: trimmed });
    } else {
      setEditValue(label);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditValue(label);
      setIsEditing(false);
    }
  };

  return (
    <div className={`custom-node custom-node--${category} status-${status}`}>
      {/* Simple single target handle */}
      {hasTarget && !targetHandles && (
        <Handle
          type="target"
          position={Position.Left}
          className={`custom-handle custom-handle--target custom-handle--${category}`}
          id="target"
        />
      )}

      {/* Multi-target handles */}
      {targetHandles &&
        targetHandles.map((h, i) => (
          <Handle
            key={h.id}
            type="target"
            position={Position.Left}
            className={`custom-handle custom-handle--target custom-handle--${category}`}
            id={h.id}
            style={{ top: `${30 + i * 28}%` }}
          />
        ))}

      {/* Header ribbon */}
      <div className={`custom-node__header custom-node__header--${category}`}>
        <div className="custom-node__icon">{icon}</div>
        <span className="custom-node__type">{categoryLabel}</span>
      </div>

      {/* Body */}
      <div className="custom-node__body">
        {isEditing ? (
          <input
            ref={inputRef}
            className="custom-node__label-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span 
            className="custom-node__label" 
            onDoubleClick={handleDoubleClick}
            title="Double-click to edit"
          >
            {label}
          </span>
        )}
        {description && (
          <span className="custom-node__description">{description}</span>
        )}
      </div>

      {/* Handle labels (for multi-handle nodes) */}
      {targetHandles && (
        <div className="custom-node__handle-labels custom-node__handle-labels--left">
          {targetHandles.map((h) => (
            <span key={h.id} className="custom-node__handle-label">{h.label}</span>
          ))}
        </div>
      )}

      {sourceHandles && (
        <div className="custom-node__handle-labels custom-node__handle-labels--right">
          {sourceHandles.map((h) => (
            <span key={h.id} className="custom-node__handle-label">{h.label}</span>
          ))}
        </div>
      )}

      {/* Simple single source handle */}
      {hasSource && !sourceHandles && (
        <Handle
          type="source"
          position={Position.Right}
          className={`custom-handle custom-handle--source custom-handle--${category}`}
          id="source"
        />
      )}

      {/* Multi-source handles */}
      {sourceHandles &&
        sourceHandles.map((h, i) => (
          <Handle
            key={h.id}
            type="source"
            position={Position.Right}
            className={`custom-handle custom-handle--source custom-handle--${category}`}
            id={h.id}
            style={{ top: `${30 + i * 28}%` }}
          />
        ))}
    </div>
  );
}

export default memo(BaseNode);
