import { useState, type DragEvent, type ReactNode } from 'react';
import './Sidebar.css';

/* ===== Node Definition Type ===== */
interface NodeDef {
  type: string;
  label: string;
  description: string;
  icon: ReactNode;
}

/* ===== Category Type ===== */
interface Category {
  id: string;
  title: string;
  accent: string;
  nodes: NodeDef[];
}

/* ===== SVG Icon Props ===== */
const ip = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/* ===== Node Categories ===== */
const categories: Category[] = [
  {
    id: 'data-source',
    title: 'Data Sources',
    accent: 'emerald',
    nodes: [
      {
        type: 'apiSource',
        label: 'API Fetch',
        description: 'Fetch from REST API',
        icon: (
          <svg {...ip}>
            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
          </svg>
        ),
      },
      {
        type: 'dbSource',
        label: 'Database',
        description: 'Query a database',
        icon: (
          <svg {...ip}>
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
          </svg>
        ),
      },
      {
        type: 'fileSource',
        label: 'File Import',
        description: 'Import from file',
        icon: (
          <svg {...ip}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
      {
        type: 'timerSource',
        label: 'Timer',
        description: 'Schedule triggers',
        icon: (
          <svg {...ip}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'math',
    title: 'Math Operations',
    accent: 'violet',
    nodes: [
      {
        type: 'mathAdd',
        label: 'Add',
        description: 'Sum two values',
        icon: (
          <svg {...ip}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        ),
      },
      {
        type: 'mathMultiply',
        label: 'Multiply',
        description: 'Multiply values',
        icon: (
          <svg {...ip}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ),
      },
      {
        type: 'mathAverage',
        label: 'Average',
        description: 'Compute mean value',
        icon: (
          <svg {...ip}>
            <line x1="4" y1="20" x2="20" y2="4" />
            <circle cx="12" cy="6" r="2" />
            <circle cx="12" cy="18" r="2" />
          </svg>
        ),
      },
      {
        type: 'mathCompare',
        label: 'Compare',
        description: 'Branch by condition',
        icon: (
          <svg {...ip}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'action',
    title: 'Action Triggers',
    accent: 'amber',
    nodes: [
      {
        type: 'emailAction',
        label: 'Send Email',
        description: 'Email notification',
        icon: (
          <svg {...ip}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
      },
      {
        type: 'webhookAction',
        label: 'Webhook',
        description: 'POST to endpoint',
        icon: (
          <svg {...ip}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        ),
      },
      {
        type: 'logAction',
        label: 'Log Output',
        description: 'Log to console',
        icon: (
          <svg {...ip}>
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        ),
      },
      {
        type: 'saveAction',
        label: 'Save File',
        description: 'Export data to file',
        icon: (
          <svg {...ip}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'ai-models',
    title: 'AI Models',
    accent: 'rose',
    nodes: [
      {
        type: 'aiLlm',
        label: 'LLM Generate',
        description: 'Generate text via API',
        icon: (
          <svg {...ip}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'transformation',
    title: 'Transformation',
    accent: 'indigo',
    nodes: [
      {
        type: 'transformFilter',
        label: 'Filter Data',
        description: 'Exclude items by rule',
        icon: (
          <svg {...ip}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        ),
      },
      {
        type: 'transformMap',
        label: 'Map Data',
        description: 'Transform schema',
        icon: (
          <svg {...ip}>
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
        ),
      },
    ],
  },
];

/* ===== Chevron Icon ===== */
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`sidebar__chevron ${open ? 'sidebar__chevron--open' : ''}`}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* ===== Drag Grip Icon ===== */
const GripIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
  </svg>
);

/* ===== Sidebar Component ===== */
function Sidebar() {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'data-source': true,
    'math': false,
    'action': false,
    'ai-models': true,
    'transformation': true,
  });

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar" id="sidebar">
      {/* Logo */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <div className="sidebar__logo-text">
            <h1>NexusFlow</h1>
            <span className="sidebar__version">v1.0</span>
          </div>
        </div>
      </div>

      <div className="sidebar__divider" />

      {/* Section Title */}
      <div className="sidebar__section">
        <h2 className="sidebar__section-title">Node Library</h2>
        <p className="sidebar__section-desc">Drag nodes onto the canvas</p>
      </div>

      {/* Scrollable categories */}
      <div className="sidebar__categories">
        {categories.map((cat) => {
          const isOpen = openCategories[cat.id] ?? true;
          return (
            <div key={cat.id} className="sidebar__category" id={`category-${cat.id}`}>
              {/* Category header (toggle) */}
              <button
                className={`sidebar__category-header sidebar__category-header--${cat.accent}`}
                onClick={() => toggleCategory(cat.id)}
                id={`toggle-${cat.id}`}
              >
                <div className={`sidebar__category-dot sidebar__category-dot--${cat.accent}`} />
                <span className="sidebar__category-title">{cat.title}</span>
                <span className="sidebar__category-count">{cat.nodes.length}</span>
                <ChevronIcon open={isOpen} />
              </button>

              {/* Collapsible node list */}
              <div className={`sidebar__category-nodes ${isOpen ? 'sidebar__category-nodes--open' : ''}`}>
                {cat.nodes.map((node) => (
                  <div
                    key={node.type}
                    className={`sidebar__node-card sidebar__node-card--${cat.accent}`}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    id={`sidebar-node-${node.type}`}
                  >
                    <div className={`sidebar__node-icon sidebar__node-icon--${cat.accent}`}>
                      {node.icon}
                    </div>
                    <div className="sidebar__node-info">
                      <span className="sidebar__node-label">{node.label}</span>
                      <span className="sidebar__node-desc">{node.description}</span>
                    </div>
                    <div className="sidebar__node-drag-hint">
                      <GripIcon />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="sidebar__footer">
        <div className="sidebar__help">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Drag & drop to build your workflow</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
