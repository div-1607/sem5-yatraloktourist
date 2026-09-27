const Review = require('../models/Review');
const Destination = require('../models/Destination');

/**
 * @desc    Add a review for destination
 * @route   POST /api/reviews
 * @access  Private (Tourist)
 */
const addReview = async (req, res, next) => {
  try {
    const { destinationId, rating, comment } = req.body;

    if (!destinationId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Destination ID, rating, and comment are required.',
      });
    }

    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found.',
      });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      destination: destinationId,
      user: req.user._id,
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
      await existingReview.save();

      return res.status(200).json({
        success: true,
        message: 'Your review has been updated.',
        data: existingReview,
      });
    }

    const review = await Review.create({
      destination: destinationId,
      user: req.user._id,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a destination
 * @route   GET /api/reviews/:destinationId
 * @access  Public
 */
const getDestinationReviews = async (req, res, next) => {
  try {
    const { destinationId } = req.params;

    const reviews = await Review.find({ destination: destinationId })
      .populate('user', 'name city createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Author or Admin)
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    // Check ownership or admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review.',
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getDestinationReviews,
  deleteReview,
};
