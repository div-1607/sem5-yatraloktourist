const mongoose = require('mongoose');

const highRiskZoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    riskType: {
      type: String,
      enum: [
        'RIP_CURRENT',
        'LANDSLIDE_PRONE',
        'STEEP_CLIFF',
        'WILDLIFE_CORRIDOR',
        'FLASH_FLOOD_ZONE',
        'ISOLATED_DARK_STRETCH',
        'RESTRICTED_DEFENSE',
      ],
      required: true,
    },
    center: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    radiusMeters: {
      type: Number,
      default: 400,
    },
    riskLevel: {
      type: String,
      enum: ['MODERATE', 'HIGH', 'SEVERE'],
      default: 'HIGH',
    },
    advisoryMessage: {
      type: String,
      required: true,
    },
    recommendedAction: {
      type: String,
      default: 'Do not cross protective barriers. Maintain safe distance.',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

highRiskZoneSchema.index({ center: '2dsphere' });
highRiskZoneSchema.index({ riskLevel: 1, isActive: 1 });

module.exports = mongoose.model('HighRiskZone', highRiskZoneSchema);
