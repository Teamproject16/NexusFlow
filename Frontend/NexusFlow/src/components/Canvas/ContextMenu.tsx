import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import './ContextMenu.css';

interface ContextMenuProps {
  id: string;
  top: number;
  left: number;
  onClick: () => void;
}

export default function ContextMenu({ id, top, left, onClick }: ContextMenuProps) {
  const { getNode, setNodes, deleteElements } = useReactFlow();

  const duplicateNode = useCallback(() => {
    const node = getNode(id);
    if (!node) return;

    const position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    };

    const newNode = {
      ...node,
      id: `${node.type}-${Date.now()}`,
      position,
      selected: false,
    };

    setNodes((nds) => nds.concat(newNode));
  }, [id, getNode, setNodes]);

  const deleteNode = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  return (
    <div className="context-menu" style={{ top, left }} onClick={onClick}>
      <button className="context-menu__btn" onClick={duplicateNode}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Duplicate
      </button>
      <div className="context-menu__divider" />
      <button className="context-menu__btn context-menu__btn--danger" onClick={deleteNode}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Delete
      </button>
    </div>
  );
}
