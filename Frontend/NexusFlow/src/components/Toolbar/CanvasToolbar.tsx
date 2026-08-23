import './CanvasToolbar.css';
import { useReactFlow } from '@xyflow/react';

interface CanvasToolbarProps {
  onReset: () => void;
  onSave: () => void;
  onRestore: () => void;
  onExport: () => void;
  onImport: () => void;
  onLayout: () => void;
  onRun: () => void;
  isRunning: boolean;
}

function CanvasToolbar({ onReset, onSave, onRestore, onExport, onImport, onLayout, onRun, isRunning }: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="canvas-toolbar" id="canvas-toolbar">
      <button
        className="canvas-toolbar__btn"
        onClick={onRun}
        disabled={isRunning}
        title="Run Workflow"
        id="btn-run"
        style={{ color: isRunning ? 'var(--text-muted)' : 'var(--accent-emerald)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isRunning ? "none" : "currentColor"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </button>

      <div className="canvas-toolbar__divider" />

      <button
        className="canvas-toolbar__btn"
        onClick={onSave}
        title="Save Canvas"
        id="btn-save"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      </button>

      <button
        className="canvas-toolbar__btn"
        onClick={onRestore}
        title="Restore Canvas"
        id="btn-restore"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>

      <div className="canvas-toolbar__divider" />

      <button
        className="canvas-toolbar__btn"
        onClick={onExport}
        title="Export JSON"
        id="btn-export"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      <button
        className="canvas-toolbar__btn"
        onClick={onImport}
        title="Import JSON"
        id="btn-import"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>

      <div className="canvas-toolbar__divider" />

      <button
        className="canvas-toolbar__btn"
        onClick={() => zoomIn({ duration: 300 })}
        title="Zoom In"
        id="btn-zoom-in"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>

      <button
        className="canvas-toolbar__btn"
        onClick={() => zoomOut({ duration: 300 })}
        title="Zoom Out"
        id="btn-zoom-out"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>

      <div className="canvas-toolbar__divider" />

      <button
        className="canvas-toolbar__btn"
        onClick={() => fitView({ duration: 400, padding: 0.2 })}
        title="Fit View"
        id="btn-fit-view"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>

      <div className="canvas-toolbar__divider" />

      <button
        className="canvas-toolbar__btn"
        onClick={onLayout}
        title="Auto Layout"
        id="btn-layout"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>

      <button
        className="canvas-toolbar__btn canvas-toolbar__btn--danger"
        onClick={onReset}
        title="Reset Canvas"
        id="btn-reset"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}

export default CanvasToolbar;
