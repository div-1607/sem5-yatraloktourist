const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getSystemContacts,
  getMyContacts,
  addContact,
  updateContact,
  deleteContact,
  getZoneContacts,
  createAdminContact,
  getAllContactsAdmin,
} = require('../controllers/contactController');

// Public routes
router.get('/system', getSystemContacts);
router.get('/zone/:zoneId', getZoneContacts);

// Tourist routes
router.get('/my', protect, getMyContacts);
router.post('/', protect, addContact);
router.put('/:id', protect, updateContact);
router.delete('/:id', protect, deleteContact);

// Admin routes
router.post('/admin', protect, adminOnly, createAdminContact);
router.get('/admin/all', protect, adminOnly, getAllContactsAdmin);

module.exports = router;
