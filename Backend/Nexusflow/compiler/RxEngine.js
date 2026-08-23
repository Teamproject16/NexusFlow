const { Subject, bufferCount, map, filter } = require('rxjs');

class RxEngine {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.streams = new Map();
    this.subscriptions = [];
    this.io = null;
  }

  compile(flowJson, ioInstance) {
    console.log('Compiling React Flow Graph...');
    
    // Clean up previous runs
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.streams.clear();
    
    this.nodes = flowJson.nodes || [];
    this.edges = flowJson.edges || [];
    this.io = ioInstance;
    
    // 1. Initialize Subjects for all Source nodes
    this.nodes.forEach(node => {
      if (node.type.startsWith('sensor')) {
         // Create a subject for each sensor node, keyed by the node's ID (which represents the sensor)
         // In a real app, you'd map physical sensor IDs to node IDs. Here we assume node ID = sensor ID for simplicity,
         // or we map it based on config. Let's use the node ID as the stream entry point.
         this.streams.set(node.id, new Subject());
         console.log(`Created stream for source: ${node.id} (${node.type})`);
      }
    });

    // 2. Wire up edges & processors
    // To properly build the DAG of streams, we should process edges in topological order, 
    // or recursively build from sources.
    // For simplicity, we'll iterate edges and build the pipelines.
    // In a complex graph, a node might have multiple inputs, which would require combineLatest/withLatestFrom.
    // Here we'll handle basic 1-to-1 flows.
    
    this.edges.forEach(edge => {
      const sourceNode = this.nodes.find(n => n.id === edge.source);
      const targetNode = this.nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;

      let sourceStream = this.streams.get(edge.source);
      
      // If the source stream doesn't exist yet (e.g., intermediate node), we create it
      if (!sourceStream) {
          sourceStream = new Subject();
          this.streams.set(edge.source, sourceStream);
      }

      let processedStream = sourceStream;
      
      // Apply operators based on Target Node type
      switch (targetNode.type) {
        case 'filterMovingAverage':
          console.log(`Wiring Moving Average for ${targetNode.id}`);
          processedStream = sourceStream.pipe(
            bufferCount(5, 1),
            map(arr => {
              const sum = arr.reduce((acc, curr) => acc + curr.value, 0);
              return { ...arr[arr.length-1], value: sum / arr.length, isMovingAverage: true };
            })
          );
          // Store this processed stream so next nodes can connect to it
          this.streams.set(targetNode.id, processedStream);
          break;
          
        case 'filterThreshold':
          console.log(`Wiring Threshold for ${targetNode.id}`);
          // Example: hardcoded threshold of > 80. Realistically, this comes from targetNode.data
          processedStream = sourceStream.pipe(
            filter(data => data.value > 80)
          );
          this.streams.set(targetNode.id, processedStream);
          break;
          
        case 'actionSms':
        case 'actionEmail':
        case 'actionWebhook':
            console.log(`Wiring Action ${targetNode.type} for ${targetNode.id}`);
            // Terminal node - subscribe and act
            const sub = sourceStream.subscribe(data => {
                this.executeAction(targetNode, data);
            });
            this.subscriptions.push(sub);
            break;
      }
    });
    
    console.log('Graph compilation complete. Streams are ready.');
  }

  executeAction(actionNode, data) {
    const msg = `[${actionNode.type}] Triggered from ${actionNode.id} | Data: ${JSON.stringify(data)}`;
    console.log(msg);
    if (this.io) {
        this.io.emit('alert', {
            nodeId: actionNode.id,
            type: actionNode.type,
            data: data,
            message: msg
        });
    }
  }

  // Inject data into a specific source node's stream
  injectTelemetry(sensorId, data) {
      // Find the node that corresponds to this sensor. 
      // For simplicity in this demo, we assume the client passes the Node ID as the sensorId,
      // or we broadcast to all sensor nodes of that type.
      // Let's broadcast to all sensor nodes for demonstration.
      this.nodes.forEach(node => {
          if (node.type.startsWith('sensor')) {
             const stream = this.streams.get(node.id);
             if (stream) {
                 stream.next(data);
             }
          }
      });
  }
}

module.exports = RxEngine;
