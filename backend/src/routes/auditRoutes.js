const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  cleanupAuditLogs,
} = require('../controllers/auditController');

// All audit routes are admin-only
router.get('/stats/summary', protect, adminOnly, getAuditStats);
router.get('/', protect, adminOnly, getAuditLogs);
router.get('/:id', protect, adminOnly, getAuditLogById);
router.delete('/cleanup', protect, adminOnly, cleanupAuditLogs);

module.exports = router;
