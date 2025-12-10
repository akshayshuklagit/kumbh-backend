const mongoose = require('mongoose');

const trafficSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  ip: {
    type: String,
    trim: true
  },
  referrer: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Traffic', trafficSchema);