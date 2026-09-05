// Central API service for communicating with the NexusFlow backend
const API_BASE = 'http://localhost:3000';

/**
 * Deploys a React Flow graph JSON to the backend stream compiler.
 * The backend will parse the graph and wire up RxJS observables.
 */
export async function deployGraph(flowJson: object): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flowJson),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to deploy graph');
  }
  return res.json();
}

/**
 * Sends a single telemetry data point to the backend ingestion endpoint.
 */
export async function ingestTelemetry(payload: {
  sensorId: string;
  sensorType: string;
  value: number;
  metadata?: object;
}): Promise<void> {
  await fetch(`${API_BASE}/api/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function runIngestionAudit(): Promise<{
  success: boolean;
  audit: string;
  target: string;
  totalRecords: number;
  durationSeconds: number;
  writesPerSecond: number;
  storageOptimization: string;
  status: string;
}> {
  const res = await fetch(`${API_BASE}/api/telemetry/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to run ingestion audit');
  }
  return res.json();
}

export const BACKEND_URL = API_BASE;
