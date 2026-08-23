import type { Alert } from '../../hooks/useBackendSocket';
import './AlertsPanel.css';

interface AlertsPanelProps {
  alerts: Alert[];
  isConnected: boolean;
  onClear: () => void;
}

const ALERT_ICONS: Record<string, string> = {
  actionSms: '💬',
  actionEmail: '📧',
  actionWebhook: '🔗',
};

function AlertsPanel({ alerts, isConnected, onClear }: AlertsPanelProps) {
  return (
    <div className="alerts-panel" id="alerts-panel">
      {/* Header */}
      <div className="alerts-panel__header">
        <div className="alerts-panel__title">
          <div className={`alerts-panel__status-dot ${isConnected ? 'alerts-panel__status-dot--connected' : ''}`} />
          <span>Live Alerts</span>
          {alerts.length > 0 && (
            <span className="alerts-panel__count">{alerts.length}</span>
          )}
        </div>
        {alerts.length > 0 && (
          <button className="alerts-panel__clear" onClick={onClear} title="Clear all alerts">
            Clear
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="alerts-panel__list">
        {alerts.length === 0 ? (
          <div className="alerts-panel__empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p>{isConnected ? 'Awaiting alerts…' : 'Backend offline'}</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`alerts-panel__alert alerts-panel__alert--${alert.type}`}>
              <span className="alerts-panel__alert-icon">
                {ALERT_ICONS[alert.type] || '⚡'}
              </span>
              <div className="alerts-panel__alert-body">
                <span className="alerts-panel__alert-type">{alert.type}</span>
                <span className="alerts-panel__alert-value">
                  value: <strong>{typeof alert.data?.value === 'number' ? alert.data.value.toFixed(2) : '—'}</strong>
                </span>
                <span className="alerts-panel__alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AlertsPanel;
