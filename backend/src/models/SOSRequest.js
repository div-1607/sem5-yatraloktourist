const mongoose = require('mongoose');

const sosRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: 'Tourist / Traveler',
    },
    userEmail: {
      type: String,
      default: '',
    },
    userMobile: {
      type: String,
      default: 'Emergency GPS Broadcast',
    },
    digitalId: {
      type: String,
      default: 'GUEST-UNREGISTERED',
    },
    emergencyType: {
      type: String,
      default: 'Emergency SOS',
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        default: 'Location captured via GPS',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'responding', 'resolved'],
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
      default: 'Emergency SOS alert initiated by tourist.',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SOSRequest', sosRequestSchema);
