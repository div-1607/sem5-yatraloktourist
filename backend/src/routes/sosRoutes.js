const express = require('express');
const router = express.Router();
const {
  createSOS,
  getActiveSOS,
  updateSOSStatus,
  getAllSOS,
} = require('../controllers/sosController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Public or logged in user can trigger SOS
router.post('/create', optionalAuth, createSOS);

// Admin SOS management
router.get('/active', protect, adminOnly, getActiveSOS);
router.get('/all', protect, adminOnly, getAllSOS);
router.patch('/:id/status', protect, adminOnly, updateSOSStatus);
router.patch('/:id', protect, adminOnly, updateSOSStatus);
router.put('/:id', protect, adminOnly, updateSOSStatus);

module.exports = router;
