import { useEffect, useRef, useCallback, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { BACKEND_URL } from '../utils/api';

export interface Alert {
  id: string;
  nodeId: string;
  type: string;
  message: string;
  data: { value: number; sensorId: string };
  timestamp: Date;
}

export function useBackendSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

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

    socket.on('alert', (payload: Omit<Alert, 'id' | 'timestamp'>) => {
      const newAlert: Alert = {
        ...payload,
        id: `alert-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50)); // Keep last 50
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  return { isConnected, alerts, clearAlerts };
}
