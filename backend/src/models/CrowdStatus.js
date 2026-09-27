const mongoose = require('mongoose');
const { CROWD_LEVELS } = require('../config/constants');

const crowdStatusSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: Object.values(CROWD_LEVELS),
      required: true,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 20,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CrowdStatus', crowdStatusSchema);
