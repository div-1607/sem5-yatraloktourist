/**
 * Request body validators for YatraLok API
 */

/**
 * Validate location coordinates
 */
const validateCoordinates = (req, res, next) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: 'latitude and longitude are required',
    });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({
      success: false,
      message: 'latitude and longitude must be valid numbers',
    });
  }

  if (lat < -90 || lat > 90) {
    return res.status(400).json({
      success: false,
      message: 'latitude must be between -90 and 90',
    });
  }

  if (lng < -180 || lng > 180) {
    return res.status(400).json({
      success: false,
      message: 'longitude must be between -180 and 180',
    });
  }

  req.body.latitude = lat;
  req.body.longitude = lng;
  next();
};

/**
 * Validate trip creation data
 */
const validateTrip = (req, res, next) => {
  const { title, startDate, endDate } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Trip title is required');
  }

  if (!startDate) {
    errors.push('Start date is required');
  }

  if (!endDate) {
    errors.push('End date is required');
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('Start date cannot be after end date');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

/**
 * Validate zone creation data
 */
const validateZone = (req, res, next) => {
  const { name, type, center, radius } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Zone name is required');
  }

  const validTypes = ['safe', 'caution', 'restricted', 'danger', 'emergency', 'tourist-zone'];
  if (!type || !validTypes.includes(type)) {
    errors.push(`Zone type must be one of: ${validTypes.join(', ')}`);
  }

  if (!center || !center.coordinates || center.coordinates.length < 2) {
    errors.push('center.coordinates [longitude, latitude] is required');
  }

  if (!radius || radius < 10) {
    errors.push('radius must be at least 10 meters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

/**
 * Validate incident report data
 */
const validateIncident = (req, res, next) => {
  const { title, description, type, location } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Incident title is required');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Incident description is required');
  }

  const validTypes = [
    'medical', 'theft', 'harassment', 'accident', 'natural-disaster',
    'lost-tourist', 'crowd-crush', 'fire', 'structural', 'other',
  ];
  if (!type || !validTypes.includes(type)) {
    errors.push(`Incident type must be one of: ${validTypes.join(', ')}`);
  }

  if (!location || !location.lat || !location.lng) {
    errors.push('location.lat and location.lng are required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

/**
 * Validate SOS data
 */
const validateSOS = (req, res, next) => {
  const { location } = req.body;
  const errors = [];

  if (!location || !location.lat || !location.lng) {
    errors.push('location.lat and location.lng are required for SOS');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

/**
 * Validate emergency contact data
 */
const validateContact = (req, res, next) => {
  const { name, phone } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Contact name is required');
  }

  if (!phone || phone.trim().length === 0) {
    errors.push('Contact phone is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

/**
 * Validate pagination params
 */
const validatePagination = (req, res, next) => {
  if (req.query.page) {
    const page = parseInt(req.query.page);
    if (isNaN(page) || page < 1) {
      req.query.page = 1;
    }
  }

  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      req.query.limit = 20;
    }
  }

  next();
};

module.exports = {
  validateCoordinates,
  validateTrip,
  validateZone,
  validateIncident,
  validateSOS,
  validateContact,
  validatePagination,
};
