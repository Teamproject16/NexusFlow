import { useEffect, useRef, useCallback, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { BACKEND_URL } from '../utils/api';

export interface Alert {
  id: string;
  nodeId: string;
  type: string;
  label?: string;
  message: string;
  data: { value: number; sensorId: string; [key: string]: any };
  outbound?: OutboundDispatch;
  timestamp: Date | string;
}

export interface OutboundDispatch {
  channel: string;
  status: 'delivered' | 'simulated' | 'failed' | 'pending';
  details: string;
  recipient: string;
  statusCode?: number;
  latencyMs: number;
  timestamp: string;
}

export interface TelemetryPoint {
  sensorId: string;
  sensorType: string;
  value: number;
  movingAverage?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EdgePulse {
  edgeId: string;
  source: string;
  target: string;
  value: number;
  sensorType?: string;
  timestamp: string;
}

export function useBackendSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [liveTelemetry, setLiveTelemetry] = useState<TelemetryPoint[]>([]);
  const [outboundHistory, setOutboundHistory] = useState<OutboundDispatch[]>([]);
  const [activeEdgePulses, setActiveEdgePulses] = useState<Record<string, number>>({});

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to NexusFlow backend via WebSocket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
      setIsConnected(false);
    });

    // Incoming Live Alert
    socket.on('alert', (payload: any) => {
      const newAlert: Alert = {
        ...payload,
        id: payload.id || `alert-${Date.now()}-${Math.random()}`,
        timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
    });

    // Live Telemetry Stream for Recharts
    socket.on('telemetry_stream', (data: TelemetryPoint) => {
      setLiveTelemetry((prev) => {
        const pointVal = typeof data.value === 'number' ? data.value : parseFloat(String(data.value)) || 0;
        // Compute running moving average over last 5 samples
        const lastFew = [...prev.slice(-4), data];
        const avg = lastFew.reduce((acc, curr) => acc + curr.value, 0) / lastFew.length;

        const augmentedPoint: TelemetryPoint = {
          ...data,
          value: pointVal,
          movingAverage: parseFloat(avg.toFixed(2)),
          timestamp: data.timestamp || new Date().toISOString(),
        };
        return [...prev.slice(-99), augmentedPoint]; // Keep up to 100 points
      });
    });

    // Edge pulse event - makes wires glow when data flows
    socket.on('edge_pulse', (pulse: EdgePulse) => {
      setActiveEdgePulses((prev) => ({
        ...prev,
        [pulse.edgeId]: Date.now(),
        // Also map by source-target if edgeId is different
        [`${pulse.source}-${pulse.target}`]: Date.now(),
      }));
    });

    // Outbound Dispatch receipt (Week 4)
    socket.on('outbound_dispatch', (dispatch: OutboundDispatch) => {
      setOutboundHistory((prev) => [dispatch, ...prev].slice(0, 50));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Clear pulse entries older than 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveEdgePulses((prev) => {
        let changed = false;
        const next: Record<string, number> = {};
        for (const [k, time] of Object.entries(prev)) {
          if (now - time < 1500) {
            next[k] = time;
          } else {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const sendTelemetry = useCallback((data: { sensorId: string; sensorType: string; value: number }) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('telemetry', data);
    }
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  return {
    isConnected,
    alerts,
    liveTelemetry,
    outboundHistory,
    activeEdgePulses,
    sendTelemetry,
    clearAlerts,
  };
}

