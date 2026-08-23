const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  sensorId: {
    type: String,
    required: true,
  },
  sensorType: {
    type: String, // 'sensorTurbine', 'sensorTemp', 'sensorPressure'
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'sensorId',
    granularity: 'seconds' // Since IoT data is high-frequency
  }
});

const Telemetry = mongoose.model('Telemetry', telemetrySchema);

module.exports = Telemetry;
