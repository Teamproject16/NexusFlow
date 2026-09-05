import { useState, useEffect } from 'react';
import { type Node } from '@xyflow/react';
import './NodeInspectorModal.css';

interface NodeInspectorModalProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, updatedData: Record<string, unknown>) => void;
}

export default function NodeInspectorModal({
  node,
  isOpen,
  onClose,
  onSave,
}: NodeInspectorModalProps) {
  if (!isOpen || !node) return null;

  const nodeData = (node.data || {}) as Record<string, any>;
  const nodeType = node.type || '';

  const [label, setLabel] = useState(nodeData.label || '');
  const [description, setDescription] = useState(nodeData.description || '');

  // Specific configuration states
  const [operator, setOperator] = useState(nodeData.operator || '>');
  const [threshold, setThreshold] = useState(nodeData.threshold ?? 80);
  const [windowSize, setWindowSize] = useState(nodeData.windowSize ?? 5);
  const [sensorId, setSensorId] = useState(nodeData.sensorId || node.id);
  const [webhookUrl, setWebhookUrl] = useState(nodeData.webhookUrl || 'http://127.0.0.1:3000/api/webhook-test');
  const [phoneNumber, setPhoneNumber] = useState(nodeData.phoneNumber || '+1-555-0199');
  const [email, setEmail] = useState(nodeData.email || 'ops-lead@nexusflow.io');
  const [subject, setSubject] = useState(nodeData.subject || 'NexusFlow Alert: Metric Exceeded');

  useEffect(() => {
    setLabel(nodeData.label || '');
    setDescription(nodeData.description || '');
    setOperator(nodeData.operator || '>');
    setThreshold(nodeData.threshold ?? 80);
    setWindowSize(nodeData.windowSize ?? 5);
    setSensorId(nodeData.sensorId || node.id);
    setWebhookUrl(nodeData.webhookUrl || 'http://127.0.0.1:3000/api/webhook-test');
    setPhoneNumber(nodeData.phoneNumber || '+1-555-0199');
    setEmail(nodeData.email || 'ops-lead@nexusflow.io');
    setSubject(nodeData.subject || 'NexusFlow Alert: Metric Exceeded');
  }, [node]);

  const handleSave = () => {
    const updated: Record<string, unknown> = {
      ...nodeData,
      label,
      description,
    };

    if (nodeType === 'filterThreshold') {
      updated.operator = operator;
      updated.threshold = Number(threshold);
    } else if (nodeType === 'filterMovingAverage') {
      updated.windowSize = Number(windowSize);
    } else if (nodeType.startsWith('sensor')) {
      updated.sensorId = sensorId;
    } else if (nodeType === 'actionWebhook') {
      updated.webhookUrl = webhookUrl;
    } else if (nodeType === 'actionSms') {
      updated.phoneNumber = phoneNumber;
    } else if (nodeType === 'actionEmail') {
      updated.email = email;
      updated.subject = subject;
    }

    onSave(node.id, updated);
    onClose();
  };

  const getCategoryTheme = () => {
    if (nodeType.startsWith('sensor')) return 'sensor';
    if (nodeType.startsWith('filter')) return 'filter';
    if (nodeType.startsWith('action')) return 'action';
    return 'filter';
  };

  const category = getCategoryTheme();

  return (
    <div className="node-inspector-overlay" onClick={onClose}>
      <div className="node-inspector-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="node-inspector-header">
          <div className="node-inspector-title-area">
            <div className={`node-inspector-icon node-inspector-icon--${category}`}>
              {category === 'sensor' && '📡'}
              {category === 'filter' && '⚙️'}
              {category === 'action' && '🔔'}
            </div>
            <div>
              <h3>Node Configuration</h3>
              <span className="node-inspector-type-badge">{nodeType}</span>
            </div>
          </div>
          <button className="node-inspector-close" onClick={onClose} title="Close Inspector">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="node-inspector-body">
          {/* General info */}
          <div className="inspector-group">
            <label className="inspector-label">Display Name</label>
            <input
              type="text"
              className="inspector-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Node Name"
            />
          </div>

          <div className="inspector-group">
            <label className="inspector-label">Description / Subtitle</label>
            <input
              type="text"
              className="inspector-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Subtitle"
            />
          </div>

          <div className="inspector-section-divider" />
          <div className="inspector-section-title">Dynamic Logic Parameters</div>

          {/* Threshold Filter Node */}
          {nodeType === 'filterThreshold' && (
            <>
              <div className="inspector-row">
                <div className="inspector-group">
                  <label className="inspector-label">Comparison</label>
                  <select
                    className="inspector-select"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                  >
                    <option value=">">Greater than (&gt;)</option>
                    <option value="<">Less than (&lt;)</option>
                    <option value=">=">Greater or equal (&gt;=)</option>
                    <option value="<=">Less or equal (&lt;=)</option>
                    <option value="==">Equals (==)</option>
                  </select>
                </div>
                <div className="inspector-group">
                  <label className="inspector-label">Threshold Value</label>
                  <input
                    type="number"
                    className="inspector-input"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />
                </div>
              </div>
              <p className="inspector-helper">
                Rule triggers in memory when incoming data value {operator} {threshold}.
              </p>
            </>
          )}

          {/* Moving Average Filter Node */}
          {nodeType === 'filterMovingAverage' && (
            <div className="inspector-group">
              <label className="inspector-label">Sliding Window Size (samples)</label>
              <input
                type="number"
                min="2"
                max="50"
                className="inspector-input"
                value={windowSize}
                onChange={(e) => setWindowSize(e.target.value)}
              />
              <p className="inspector-helper">
                Averages the last {windowSize} telemetry data points using RxJS bufferCount.
              </p>
            </div>
          )}

          {/* Sensor Nodes */}
          {nodeType.startsWith('sensor') && (
            <div className="inspector-group">
              <label className="inspector-label">Sensor Stream Key</label>
              <input
                type="text"
                className="inspector-input"
                value={sensorId}
                onChange={(e) => setSensorId(e.target.value)}
              />
              <p className="inspector-helper">
                Matches telemetry payloads tagged with this sensor ID.
              </p>
            </div>
          )}

          {/* Webhook Action Node */}
          {nodeType === 'actionWebhook' && (
            <>
              <div className="inspector-group">
                <label className="inspector-label">Outbound Webhook URL</label>
                <input
                  type="url"
                  className="inspector-input"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.external.com/webhook"
                />
                <p className="inspector-helper">
                  NexusFlow backend will dispatch an HTTP POST request to this endpoint with JSON payload.
                </p>
              </div>
            </>
          )}

          {/* SMS Action Node */}
          {nodeType === 'actionSms' && (
            <div className="inspector-group">
              <label className="inspector-label">Recipient Phone Number</label>
              <input
                type="tel"
                className="inspector-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 555 0199"
              />
              <p className="inspector-helper">
                Dispatches high-priority SMS alert via simulated Twilio/carrier gateway.
              </p>
            </div>
          )}

          {/* Email Action Node */}
          {nodeType === 'actionEmail' && (
            <>
              <div className="inspector-group">
                <label className="inspector-label">Recipient Email</label>
                <input
                  type="email"
                  className="inspector-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nexusflow.io"
                />
              </div>
              <div className="inspector-group">
                <label className="inspector-label">Email Subject</label>
                <input
                  type="text"
                  className="inspector-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="node-inspector-footer">
          <button className="inspector-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="inspector-btn-save" onClick={handleSave}>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
