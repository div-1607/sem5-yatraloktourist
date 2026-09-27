const mongoose = require('mongoose');
const { CATEGORIES, CROWD_LEVELS } = require('../config/constants');

const destinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Destination title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      default: function () {
        if (!this.title) return undefined;
        return (
          this.title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-') +
          '-' +
          Math.floor(1000 + Math.random() * 9000)
        );
      },
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: CATEGORIES,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      validate: [
        (val) => val.length > 0,
        'At least one image URL must be provided',
      ],
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
      address: {
        type: String,
        required: [true, 'Physical address or landmark is required'],
      },
    },
    crowdStatus: {
      type: String,
      enum: Object.values(CROWD_LEVELS),
      default: CROWD_LEVELS.LOW,
      index: true,
    },
    crowdPercentage: {
      type: Number,
      default: 25,
      min: 0,
      max: 100,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    entryFee: {
      type: String,
      default: 'Free',
    },
    timings: {
      type: String,
      default: '09:00 AM - 06:00 PM',
    },
    bestTimeToVisit: {
      type: String,
      default: 'October to March',
    },
    emergencyHelpline: {
      type: String,
      default: '112 / 1363',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before saving
destinationSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

module.exports = mongoose.model('Destination', destinationSchema);
