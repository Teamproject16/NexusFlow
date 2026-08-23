require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Telemetry = require('./models/Telemetry');
const RxEngine = require('./compiler/RxEngine');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connect to MongoDB
connectDB();

// Initialize the RxEngine
const engine = new RxEngine();

// Websocket connection for real-time alerts
io.on('connection', (socket) => {
  console.log('Client connected for real-time alerts');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Mock active graph setting
let activeGraph = null;

// Endpoint to deploy a new graph from frontend
app.post('/api/deploy', (req, res) => {
  try {
    activeGraph = req.body;
    engine.compile(activeGraph, io);
    res.status(200).json({ success: true, message: 'Graph deployed and compiled successfully.' });
  } catch (error) {
    console.error('Error deploying graph:', error);
    res.status(500).json({ success: false, error: 'Failed to deploy graph.' });
  }
});

// -----------------------------------------------------
// Week 1: High-Speed Ingestion Endpoint
// -----------------------------------------------------
app.post('/api/telemetry', async (req, res) => {
  try {
    const { sensorId, sensorType, value, timestamp, metadata } = req.body;
    
    // Create new telemetry data point
    const dataPoint = {
      sensorId,
      sensorType,
      value,
      timestamp: timestamp || new Date(),
      metadata
    };

    const telemetry = new Telemetry(dataPoint);
    await telemetry.save();

    // Push data into the RxJS engine
    engine.injectTelemetry(sensorId, dataPoint);

    res.status(201).json({ success: true, data: telemetry });
  } catch (error) {
    console.error('Ingestion Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Bulk ingestion endpoint for the Week 2 Audit
app.post('/api/telemetry/bulk', async (req, res) => {
  try {
    const dataPoints = req.body; // Expects an array of telemetry objects
    
    // Set timestamp if missing
    const preparedData = dataPoints.map(dp => ({
        ...dp,
        timestamp: dp.timestamp || new Date()
    }));

    // MongoDB bulk insert is highly optimized for Time-Series collections
    await Telemetry.insertMany(preparedData, { ordered: false });
    
    // Push data into the RxJS engine (optional for bulk, but good for testing flow)
    preparedData.forEach(dp => engine.injectTelemetry(dp.sensorId, dp));

    res.status(201).json({ success: true, count: preparedData.length });
  } catch (error) {
    console.error('Bulk Ingestion Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`NexusFlow Backend listening on port ${PORT}`);
});
