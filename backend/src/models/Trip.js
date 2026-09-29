const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
  },
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  arrivalTime: { type: Date },
  departureTime: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'visited', 'skipped'],
    default: 'pending',
  },
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Trip must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      maxlength: [200, 'Trip title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'paused', 'completed', 'cancelled'],
      default: 'planning',
      index: true,
    },
    tripType: {
      type: String,
      enum: ['solo', 'couple', 'family', 'group', 'business'],
      default: 'solo',
    },
    waypoints: [waypointSchema],
    companions: [
      {
        name: { type: String, required: true },
        mobile: { type: String },
        relation: { type: String, default: 'Friend' },
      },
    ],
    budget: {
      planned: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date },
    },
    totalDistanceKm: {
      type: Number,
      default: 0,
    },
    isEmergencyActive: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String, trim: true }],
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: trip duration in days
tripSchema.virtual('durationDays').get(function () {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual: waypoints visited count
tripSchema.virtual('waypointsVisited').get(function () {
  return this.waypoints.filter((wp) => wp.status === 'visited').length;
});

tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Trip', tripSchema);
