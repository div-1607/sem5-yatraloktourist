const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getSignedInUsers,
  createDestination,
  updateDestination,
  deleteDestination,
  getUsers,
  toggleUserStatus,
  reseedDatabase,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// All admin routes require protect + adminOnly
router.use(protect, adminOnly);

router.get('/analytics', getAnalytics);
router.get('/signed-in-users', getSignedInUsers);
router.post('/reseed', reseedDatabase);

// Destinations CRUD
router.post('/destinations', createDestination);
router.put('/destinations/:id', updateDestination);
router.delete('/destinations/:id', deleteDestination);

// Users Management
router.get('/users', getUsers);
router.patch('/users/:id/status', toggleUserStatus);

module.exports = router;
