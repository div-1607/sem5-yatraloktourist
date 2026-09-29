const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  reportIncident,
  getAllIncidents,
  getIncidentById,
  updateIncident,
  addResponseLog,
  deleteIncident,
  getMyIncidents,
} = require('../controllers/incidentController');

// Tourist routes
router.post('/', protect, reportIncident);
router.get('/my', protect, getMyIncidents);
router.get('/:id', protect, getIncidentById);

// Admin routes
router.get('/', protect, adminOnly, getAllIncidents);
router.put('/:id', protect, adminOnly, updateIncident);
router.post('/:id/response', protect, adminOnly, addResponseLog);
router.delete('/:id', protect, adminOnly, deleteIncident);

module.exports = router;
