const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['police', 'ambulance', 'fire', 'hospital', 'tourism-helpline', 'embassy', 'personal', 'custom'],
      required: [true, 'Contact type is required'],
      index: true,
    },
    category: {
      type: String,
      enum: ['system', 'user-defined', 'zone-specific'],
      default: 'system',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPriority: {
      type: Boolean,
      default: false,
    },
    availableHours: {
      type: String,
      default: '24/7',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    responseTimeMinutes: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
emergencyContactSchema.index({ type: 1, category: 1, isActive: 1 });

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
