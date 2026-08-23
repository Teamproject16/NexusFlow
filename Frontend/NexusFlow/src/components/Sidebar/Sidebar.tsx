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
    title: 'Data Sources (Sensors)',
    accent: 'emerald',
    nodes: [
      {
        type: 'sensorTurbine',
        label: 'Turbine Sensor',
        description: 'Vibration & RPM',
        icon: (
          <svg {...ip}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 10 10" />
            <path d="M12 2a10 10 0 0 0-10 10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="9" x2="12" y2="2" />
            <line x1="12" y1="15" x2="12" y2="22" />
            <line x1="9" y1="12" x2="2" y2="12" />
            <line x1="15" y1="12" x2="22" y2="12" />
          </svg>
        ),
      },
      {
        type: 'sensorTemp',
        label: 'Temperature Sensor',
        description: 'Heat & Thermal Data',
        icon: (
          <svg {...ip}>
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
          </svg>
        ),
      },
      {
        type: 'sensorPressure',
        label: 'Pressure Sensor',
        description: 'Fluid & Gas PSI',
        icon: (
          <svg {...ip}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 16 16 12 12 8" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'filters',
    title: 'Math & Filters',
    accent: 'violet',
    nodes: [
      {
        type: 'filterMovingAverage',
        label: 'Moving Average',
        description: 'Smooth noisy telemetry',
        icon: (
          <svg {...ip}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        ),
      },
      {
        type: 'filterThreshold',
        label: 'Threshold Check',
        description: 'Branch if value > X',
        icon: (
          <svg {...ip}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
      {
        type: 'filterMerge',
        label: 'Data Merge',
        description: 'Combine data streams',
        icon: (
          <svg {...ip}>
            <path d="M12 2v20" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
        type: 'actionSms',
        label: 'SMS Alert',
        description: 'Send text notification',
        icon: (
          <svg {...ip}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        type: 'actionEmail',
        label: 'Email Alert',
        description: 'Send email alert',
        icon: (
          <svg {...ip}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
      },
      {
        type: 'actionWebhook',
        label: 'Webhook Trigger',
        description: 'Trigger external API',
        icon: (
          <svg {...ip}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
    'filters': true,
    'action': true,
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
            <span className="sidebar__version">IoT Edition</span>
          </div>
        </div>
      </div>

      <div className="sidebar__divider" />

      {/* Section Title */}
      <div className="sidebar__section">
        <h2 className="sidebar__section-title">Telemetry Library</h2>
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
          <span>Drag sensors & rules</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
