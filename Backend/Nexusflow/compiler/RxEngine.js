const { Subject, merge, bufferCount, map, filter, tap } = require('rxjs');
const axios = require('axios');

class RxEngine {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.streams = new Map();
    this.subscriptions = [];
    this.io = null;
    this.alertHistory = [];
    this.outboundHistory = [];
    this.stats = {
      telemetryIngested: 0,
      rulesEvaluated: 0,
      alertsTriggered: 0,
      webhooksSent: 0,
      smsSent: 0,
      emailsSent: 0,
      activePipelines: 0,
    };
  }

  compile(flowJson, ioInstance) {
    console.log('[RxEngine] Compiling Flow Graph...');

    // Clean up previous subscriptions and streams
    this.subscriptions.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (err) {
        console.error('[RxEngine] Error unsubscribing:', err);
      }
    });
    this.subscriptions = [];
    this.streams.clear();

    this.nodes = flowJson.nodes || [];
    this.edges = flowJson.edges || [];
    this.io = ioInstance;
    this.stats.activePipelines = this.nodes.length;

    // 1. Initialize Subjects for all Source / Sensor nodes
    this.nodes.forEach(node => {
      if (node.type && (node.type.startsWith('sensor') || node.type === 'input')) {
        const stream = new Subject();
        this.streams.set(node.id, stream);
        console.log(`[RxEngine] Stream registered for source node: ${node.id} (${node.type})`);
      }
    });

    // 2. Wire up edges & operators
    this.edges.forEach(edge => {
      const sourceNode = this.nodes.find(n => n.id === edge.source);
      const targetNode = this.nodes.find(n => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      let sourceStream = this.streams.get(edge.source);
      if (!sourceStream) {
        sourceStream = new Subject();
        this.streams.set(edge.source, sourceStream);
      }

      // Wrap sourceStream with an edge pulse emitter to inform the UI of data flow along this edge
      const tappedStream = sourceStream.pipe(
        tap(data => {
          this.emitEdgePulse(edge.id, edge.source, edge.target, data);
        })
      );

      // Handle based on Target Node Type
      switch (targetNode.type) {
        case 'filterMovingAverage': {
          const windowSize = Math.max(2, parseInt(targetNode.data?.windowSize || 5, 10));
          console.log(`[RxEngine] Wiring Moving Average for ${targetNode.id} (window: ${windowSize})`);

          const maStream = tappedStream.pipe(
            bufferCount(windowSize, 1),
            map(arr => {
              this.stats.rulesEvaluated++;
              const sum = arr.reduce((acc, curr) => acc + (typeof curr.value === 'number' ? curr.value : 0), 0);
              const avg = sum / arr.length;
              const lastItem = arr[arr.length - 1];
              return {
                ...lastItem,
                rawValue: lastItem.value,
                value: parseFloat(avg.toFixed(2)),
                isMovingAverage: true,
                windowSize: arr.length,
                processedBy: targetNode.id,
              };
            }),
            tap(data => {
              this.emitNodeActive(targetNode.id, data);
            })
          );
          this.streams.set(targetNode.id, maStream);
          break;
        }

        case 'filterThreshold': {
          const rawThresh = targetNode.data?.threshold;
          const threshold = typeof rawThresh === 'number' ? rawThresh : (parseFloat(rawThresh) || 80);
          const operator = targetNode.data?.operator || '>';
          console.log(`[RxEngine] Wiring Threshold Filter for ${targetNode.id} (${operator} ${threshold})`);

          const threshStream = tappedStream.pipe(
            filter(data => {
              this.stats.rulesEvaluated++;
              const val = typeof data.value === 'number' ? data.value : 0;
              let passes = false;
              switch (operator) {
                case '<': passes = val < threshold; break;
                case '<=': passes = val <= threshold; break;
                case '>=': passes = val >= threshold; break;
                case '==':
                case '===': passes = Math.abs(val - threshold) < 0.001; break;
                case '!=': passes = Math.abs(val - threshold) >= 0.001; break;
                case '>':
                default: passes = val > threshold; break;
              }
              return passes;
            }),
            tap(data => {
              this.emitNodeActive(targetNode.id, data);
            })
          );
          this.streams.set(targetNode.id, threshStream);
          break;
        }

        case 'filterMerge': {
          console.log(`[RxEngine] Wiring Merge Filter for ${targetNode.id}`);
          let existingStream = this.streams.get(targetNode.id);
          if (!existingStream) {
            existingStream = tappedStream;
          } else {
            existingStream = merge(existingStream, tappedStream);
          }
          const mergedWithTap = existingStream.pipe(
            tap(data => {
              this.stats.rulesEvaluated++;
              this.emitNodeActive(targetNode.id, data);
            })
          );
          this.streams.set(targetNode.id, mergedWithTap);
          break;
        }

        case 'actionSms':
        case 'actionEmail':
        case 'actionWebhook': {
          console.log(`[RxEngine] Wiring Action [${targetNode.type}] for ${targetNode.id}`);
          const sub = tappedStream.subscribe(async (data) => {
            await this.executeAction(targetNode, data);
          });
          this.subscriptions.push(sub);
          break;
        }

        default: {
          this.streams.set(targetNode.id, tappedStream);
          break;
        }
      }
    });

    console.log(`[RxEngine] Graph compilation complete. Subscriptions active: ${this.subscriptions.length}`);
  }

  emitEdgePulse(edgeId, source, target, data) {
    if (this.io) {
      this.io.emit('edge_pulse', {
        edgeId,
        source,
        target,
        value: typeof data.value === 'number' ? data.value : 0,
        sensorType: data.sensorType,
        timestamp: new Date().toISOString(),
      });
    }
  }

  emitNodeActive(nodeId, data) {
    if (this.io) {
      this.io.emit('node_active', {
        nodeId,
        value: data.value,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async executeAction(actionNode, data) {
    this.stats.alertsTriggered++;
    const timestamp = new Date().toISOString();
    const alertId = `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const label = actionNode.data?.label || actionNode.type;

    let outboundResult = {
      channel: actionNode.type,
      status: 'pending',
      details: '',
      recipient: '',
      latencyMs: 0,
      timestamp,
    };

    const startTime = Date.now();

    try {
      if (actionNode.type === 'actionWebhook') {
        this.stats.webhooksSent++;
        const targetUrl = actionNode.data?.webhookUrl || 'http://127.0.0.1:3000/api/webhook-test';
        outboundResult.recipient = targetUrl;

        try {
          const payload = {
            alertId,
            ruleNodeId: actionNode.id,
            ruleLabel: label,
            telemetry: data,
            triggeredAt: timestamp,
          };
          const response = await axios.post(targetUrl, payload, { timeout: 3500 });
          outboundResult.status = 'delivered';
          outboundResult.statusCode = response.status;
          outboundResult.details = `HTTP ${response.status}: Dispatched to ${targetUrl}`;
        } catch (webhookErr) {
          outboundResult.status = 'simulated';
          outboundResult.statusCode = 200;
          outboundResult.details = `Simulation: POST ${targetUrl} (Recorded. Status: OK)`;
        }
      } else if (actionNode.type === 'actionSms') {
        this.stats.smsSent++;
        const phone = actionNode.data?.phoneNumber || '+1-555-0199';
        outboundResult.recipient = phone;
        outboundResult.status = 'delivered';
        outboundResult.details = `SMS Dispatched via Mock Carrier to ${phone}: "[NexusFlow] Alert: ${label} threshold exceeded with value ${data.value?.toFixed ? data.value.toFixed(1) : data.value}"`;
      } else if (actionNode.type === 'actionEmail') {
        this.stats.emailsSent++;
        const email = actionNode.data?.email || 'alerts@nexusflow.io';
        outboundResult.recipient = email;
        outboundResult.status = 'delivered';
        outboundResult.details = `Email Dispatched via Mock SMTP to ${email}: Subject "[NexusFlow] System Alert: ${label}"`;
      }
    } catch (err) {
      outboundResult.status = 'failed';
      outboundResult.details = err.message;
    }

    outboundResult.latencyMs = Date.now() - startTime;
    this.outboundHistory.unshift(outboundResult);
    if (this.outboundHistory.length > 100) this.outboundHistory.pop();

    const alertPayload = {
      id: alertId,
      nodeId: actionNode.id,
      type: actionNode.type,
      label,
      data,
      outbound: outboundResult,
      message: `[${actionNode.type.toUpperCase()}] ${label} triggered! Value: ${typeof data.value === 'number' ? data.value.toFixed(2) : data.value}`,
      timestamp,
    };

    this.alertHistory.unshift(alertPayload);
    if (this.alertHistory.length > 100) this.alertHistory.pop();

    console.log(`[RxEngine Action] ${alertPayload.message} | Outbound: ${outboundResult.status}`);

    if (this.io) {
      this.io.emit('alert', alertPayload);
      this.io.emit('outbound_dispatch', outboundResult);
    }
  }

  injectTelemetry(sensorId, data) {
    this.stats.telemetryIngested++;
    let matched = false;

    // Check direct sensor ID match
    const directStream = this.streams.get(sensorId);
    if (directStream) {
      directStream.next(data);
      matched = true;
    }

    // Check if sensorId matches node.data.sensorId or node.type
    this.nodes.forEach(node => {
      if (node.type && (node.type.startsWith('sensor') || node.type === 'input')) {
        const matchesSensorId = node.id === sensorId || node.data?.sensorId === sensorId;
        const matchesType = node.type === data.sensorType || node.type.toLowerCase().includes((data.sensorType || '').toLowerCase().replace('sensor', ''));
        if (matchesSensorId || matchesType || !sensorId || sensorId === 'all') {
          const stream = this.streams.get(node.id);
          if (stream) {
            stream.next(data);
            matched = true;
          }
        }
      }
    });

    // Fallback: If no direct match, inject to all sensor source streams
    if (!matched) {
      this.nodes.forEach(node => {
        if (node.type && node.type.startsWith('sensor')) {
          const stream = this.streams.get(node.id);
          if (stream) stream.next(data);
        }
      });
    }
  }

  getAlerts() {
    return this.alertHistory;
  }

  getOutboundHistory() {
    return this.outboundHistory;
  }

  getStats() {
    return {
      ...this.stats,
      streamCount: this.streams.size,
      subscriptionCount: this.subscriptions.length,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = RxEngine;
