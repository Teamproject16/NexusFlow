const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    index: true,
  },
  nodeId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  label: {
    type: String,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  outbound: {
    type: mongoose.Schema.Types.Mixed,
  },
  message: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  }
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
