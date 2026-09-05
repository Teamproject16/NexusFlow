import { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import type { Alert, OutboundDispatch, TelemetryPoint } from '../../hooks/useBackendSocket';
import { runIngestionAudit } from '../../utils/api';
import './LiveDashboard.css';

interface LiveDashboardProps {
  liveTelemetry: TelemetryPoint[];
  alerts: Alert[];
  outboundHistory: OutboundDispatch[];
  isConnected: boolean;
  onSendTelemetry: (point: { sensorId: string; sensorType: string; value: number }) => void;
  onBackToCanvas: () => void;
}

export default function LiveDashboard({
  liveTelemetry,
  alerts,
  outboundHistory,
  isConnected,
  onSendTelemetry,
  onBackToCanvas,
}: LiveDashboardProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [bufferSize, setBufferSize] = useState<number>(30);
  const [frozenData, setFrozenData] = useState<TelemetryPoint[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    success: boolean;
    audit: string;
    target: string;
    totalRecords: number;
    durationSeconds: number;
    writesPerSecond: number;
    storageOptimization: string;
    status: string;
  } | null>(null);

  // When paused, freeze data snapshot; otherwise use incoming liveTelemetry
  useEffect(() => {
    if (!isPaused) {
      setFrozenData(liveTelemetry);
    }
  }, [liveTelemetry, isPaused]);

  // Display data limited by buffer size
  const chartData = useMemo(() => {
    const raw = isPaused ? frozenData : liveTelemetry;
    return raw.slice(-bufferSize).map((item, index) => ({
      index,
      time: new Date(item.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
      value: typeof item.value === 'number' ? parseFloat(item.value.toFixed(2)) : 0,
      movingAverage: typeof item.movingAverage === 'number' ? parseFloat(item.movingAverage.toFixed(2)) : undefined,
      sensorType: item.sensorType || 'sensorTurbine',
      sensorId: item.sensorId,
    }));
  }, [frozenData, liveTelemetry, isPaused, bufferSize]);

  // Latest readings
  const latestPoint = chartData[chartData.length - 1];
  const currentVal = latestPoint ? latestPoint.value : 0;
  const currentMA = latestPoint?.movingAverage ?? currentVal;

  // Alerts breakdown for BarChart (Industrial Ember theme)
  const alertStats = useMemo(() => {
    let webhookCount = 0;
    let smsCount = 0;
    let emailCount = 0;

    alerts.forEach((a) => {
      if (a.type === 'actionWebhook') webhookCount++;
      else if (a.type === 'actionSms') smsCount++;
      else if (a.type === 'actionEmail') emailCount++;
    });

    return [
      { name: 'Webhooks', count: webhookCount, color: '#f59e0b' },
      { name: 'SMS Alerts', count: smsCount, color: '#f97316' },
      { name: 'Emails', count: emailCount, color: '#ea580c' },
    ];
  }, [alerts]);

  // Quick mock telemetry generator
  const triggerSampleData = (type: 'sensorTurbine' | 'sensorTemp' | 'sensorPressure') => {
    let val = 0;
    if (type === 'sensorTurbine') val = Math.floor(60 + Math.random() * 65);
    else if (type === 'sensorTemp') val = Math.floor(40 + Math.random() * 55);
    else val = Math.floor(20 + Math.random() * 80);

    onSendTelemetry({
      sensorId: type === 'sensorTurbine' ? 'sensor-1' : type === 'sensorTemp' ? 'sensor-2' : 'sensor-3',
      sensorType: type,
      value: val,
    });
  };

  // Run Mid-Project Review 5,000 writes/sec audit
  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await runIngestionAudit();
      setAuditResult(res);
    } catch (err: any) {
      console.error('Audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="live-dashboard" id="live-dashboard">
      {/* Header */}
      <div className="live-dashboard__header">
        <div className="live-dashboard__title-group">
          <button className="live-dashboard__btn" onClick={onBackToCanvas} title="Back to Workflow Canvas">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Flow Canvas
          </button>
          <h2 className="live-dashboard__title">
            NexusFlow Live Telemetry &amp; Metrics
          </h2>
          <div className="live-dashboard__badge">
            <span className="live-dashboard__dot" />
            {isConnected ? 'Stream Active' : 'Disconnected'}
          </div>
        </div>

        <div className="live-dashboard__controls">
          <button
            className={`live-dashboard__btn ${isPaused ? 'live-dashboard__btn--pause' : ''}`}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? '▶ Resume Stream' : '⏸ Pause'}
          </button>

          <select
            className="live-dashboard__btn"
            value={bufferSize}
            onChange={(e) => setBufferSize(Number(e.target.value))}
            style={{ padding: '7px 10px' }}
          >
            <option value="20">20 Points</option>
            <option value="30">30 Points</option>
            <option value="50">50 Points</option>
            <option value="100">100 Points</option>
          </select>

          <button
            className="live-dashboard__btn live-dashboard__btn--audit"
            onClick={handleRunAudit}
            disabled={isAuditing}
            title="Mid-Project Review: Audit 5,000 Time-Series Writes/sec"
          >
            {isAuditing ? 'Auditing 5k Writes…' : '⚡ Ingestion Audit (5k/s)'}
          </button>

          <button
            className="live-dashboard__btn live-dashboard__btn--primary"
            onClick={() => triggerSampleData('sensorTurbine')}
            title="Inject real-time telemetry into RxJS pipeline"
          >
            + Pulse Telemetry
          </button>
        </div>
      </div>

      {/* Mid-Project Review Audit Report Banner */}
      {auditResult && (
        <div className="audit-banner">
          <div>
            <strong>✅ {auditResult.audit}:</strong> Ingested <strong>{auditResult.totalRecords}</strong> records in{' '}
            <strong>{auditResult.durationSeconds}s</strong> ({' '}
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>{auditResult.writesPerSecond} writes/sec</span> )
            — {auditResult.storageOptimization}
          </div>
          <span className="audit-banner__status">{auditResult.status}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="live-dashboard__kpis">
        <div className="kpi-card kpi-card--emerald">
          <div className="kpi-card__title">
            <span>Turbine Telemetry</span>
            <span>RPM/Hz</span>
          </div>
          <div className="kpi-card__value">
            {currentVal > 0 ? `${currentVal.toFixed(1)}` : '0.0'}
          </div>
          <div className="kpi-card__sub">
            <span>● Live WebSocket Input</span>
          </div>
        </div>

        <div className="kpi-card kpi-card--violet">
          <div className="kpi-card__title">
            <span>Moving Avg (RxJS)</span>
            <span>Smoothed</span>
          </div>
          <div className="kpi-card__value">
            {currentMA > 0 ? `${currentMA.toFixed(1)}` : '0.0'}
          </div>
          <div className="kpi-card__sub">
            <span>● Buffer Window: 5 samples</span>
          </div>
        </div>

        <div className="kpi-card kpi-card--amber">
          <div className="kpi-card__title">
            <span>Active Alerts</span>
            <span>Triggered</span>
          </div>
          <div className="kpi-card__value">
            {alerts.length}
          </div>
          <div className="kpi-card__sub">
            <span>● In-memory rule triggers</span>
          </div>
        </div>

        <div className="kpi-card kpi-card--cyan">
          <div className="kpi-card__title">
            <span>Outbound Dispatches</span>
            <span>Week 4</span>
          </div>
          <div className="kpi-card__value">
            {outboundHistory.length}
          </div>
          <div className="kpi-card__sub">
            <span>● Webhooks, SMS &amp; Email</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="live-dashboard__chart-grid">
        {/* Real-time Streaming Area Chart */}
        <div className="chart-card">
          <div className="chart-card__header">
            <div>
              <h3 className="chart-card__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                High-Velocity Telemetry Stream (Live Recharts)
              </h3>
              <span className="chart-card__subtitle">WebSocket push updates running at sub-second frequency</span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="maGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161922',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#f8fafc',
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Raw Telemetry"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#streamGrad)"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="movingAverage"
                  name="RxJS Moving Average"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rule Alert Distribution Bar Chart */}
        <div className="chart-card">
          <div className="chart-card__header">
            <div>
              <h3 className="chart-card__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Alert Dispatch Channels
              </h3>
              <span className="chart-card__subtitle">Rule activations by target integration</span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161922',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#f8fafc',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Dispatches" radius={[6, 6, 0, 0]}>
                  {alertStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Week 4 Outbound Integrations Feed */}
      <div className="live-dashboard__outbound">
        <div className="chart-card__header">
          <div>
            <h3 className="chart-card__title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Outbound Webhooks &amp; Alert Delivery History (Week 4)
            </h3>
            <span className="chart-card__subtitle">Real-time HTTP Webhooks, SMS and SMTP delivery receipts</span>
          </div>
        </div>

        <div className="outbound-list">
          {outboundHistory.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 13, padding: '12px 0', textAlign: 'center' }}>
              No outbound alerts triggered yet. Trigger telemetry over threshold to test Webhook/SMS/Email dispatches.
            </div>
          ) : (
            outboundHistory.map((item, idx) => (
              <div key={idx} className="outbound-item">
                <div className="outbound-item__left">
                  <span
                    className={`outbound-tag ${
                      item.channel === 'actionWebhook'
                        ? 'outbound-tag--webhook'
                        : item.channel === 'actionSms'
                        ? 'outbound-tag--sms'
                        : 'outbound-tag--email'
                    }`}
                  >
                    {item.channel.replace('action', '')}
                  </span>
                  <span className="outbound-item__details">{item.details}</span>
                </div>
                <div className="outbound-item__right">
                  <span className="outbound-badge-status">{item.status.toUpperCase()}</span>
                  <span>{item.latencyMs}ms</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
