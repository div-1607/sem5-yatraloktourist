const Destination = require('../models/Destination');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { CATEGORIES } = require('../config/constants');

/**
 * @desc    Get all destinations with search & filters
 * @route   GET /api/destinations
 * @access  Public
 */
const getDestinations = async (req, res, next) => {
  try {
    const {
      search,
      state,
      city,
      category,
      crowdStatus,
      minRating,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Filters
    if (state && state !== 'All') {
      query.state = state;
    }

    if (city && city !== 'All') {
      query.city = city;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (crowdStatus && crowdStatus !== 'All') {
      query.crowdStatus = crowdStatus.toLowerCase();
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Sorting
    let sortQuery = { isPopular: -1, rating: -1, createdAt: -1 };
    if (sort === 'rating-desc') {
      sortQuery = { rating: -1 };
    } else if (sort === 'rating-asc') {
      sortQuery = { rating: 1 };
    } else if (sort === 'title-asc') {
      sortQuery = { title: 1 };
    } else if (sort === 'crowd-asc') {
      // low to high
      sortQuery = { crowdPercentage: 1 };
    } else if (sort === 'crowd-desc') {
      sortQuery = { crowdPercentage: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Destination.countDocuments(query);
    const destinations = await Destination.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: destinations.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured popular destinations for landing page
 * @route   GET /api/destinations/featured
 * @access  Public
 */
const getFeatured = async (req, res, next) => {
  try {
    const featured = await Destination.find({ isPopular: true })
      .limit(6)
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: featured.length,
      data: featured,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get state and city hierarchy
 * @route   GET /api/destinations/hierarchy
 * @access  Public
 */
const getStatesAndCities = async (req, res, next) => {
  try {
    const hierarchy = await Destination.aggregate([
      {
        $group: {
          _id: '$state',
          cities: { $addToSet: '$city' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          state: '$_id',
          cities: 1,
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { state: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get destination by ID or Slug
 * @route   GET /api/destinations/:id
 * @access  Public
 */
const getDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let destination;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      destination = await Destination.findById(id);
    } else {
      destination = await Destination.findOne({ slug: id });
    }

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    // Fetch associated reviews
    const reviews = await Review.find({ destination: destination._id })
      .populate('user', 'name city')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: destination,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get categories list
 * @route   GET /api/destinations/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Fallback if none in collection yet
    if (categories.length === 0) {
      return res.status(200).json({
        success: true,
        data: CATEGORIES.map((name) => ({
          name,
          slug: name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
        })),
      });
    }

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recommended destinations for tourist
 * @route   GET /api/destinations/recommendations
 * @access  Public / Optional Auth
 */
const getRecommendations = async (req, res, next) => {
  try {
    let recommendations;

    if (req.user && req.user.city) {
      // Find destinations in or near user's state/city or high rating
      recommendations = await Destination.find({
        $or: [
          { city: { $regex: req.user.city, $options: 'i' } },
          { rating: { $gte: 4.7 } },
        ],
      })
        .limit(6)
        .sort({ rating: -1 });
    }

    if (!recommendations || recommendations.length === 0) {
      recommendations = await Destination.find().sort({ rating: -1 }).limit(6);
    }

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDestinations,
  getFeatured,
  getStatesAndCities,
  getDestinationById,
  getCategories,
  getRecommendations,
};
