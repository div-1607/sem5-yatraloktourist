const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
  getNearbyZones,
  toggleZoneStatus,
} = require('../controllers/zoneController');

// Public routes
router.get('/', getAllZones);
router.get('/nearby', getNearbyZones);
router.get('/:id', getZoneById);

// Admin routes
router.post('/', protect, adminOnly, createZone);
router.put('/:id', protect, adminOnly, updateZone);
router.delete('/:id', protect, adminOnly, deleteZone);
router.patch('/:id/toggle', protect, adminOnly, toggleZoneStatus);

module.exports = router;
