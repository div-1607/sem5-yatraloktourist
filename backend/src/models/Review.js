const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination is required for review'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required for review'],
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide a rating between 1 and 5'],
    },
    comment: {
      type: String,
      required: [true, 'Please write a review comment'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting multiple reviews for the same destination
reviewSchema.index({ destination: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (destinationId) {
  const stats = await this.aggregate([
    {
      $match: { destination: destinationId },
    },
    {
      $group: {
        _id: '$destination',
        numReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    const Destination = mongoose.model('Destination');
    if (stats.length > 0) {
      await Destination.findByIdAndUpdate(destinationId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].numReviews,
      });
    } else {
      await Destination.findByIdAndUpdate(destinationId, {
        rating: 4.5,
        numReviews: 0,
      });
    }
  } catch (err) {
    console.error('Error updating destination average rating:', err);
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRating(this.destination);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.destination);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
