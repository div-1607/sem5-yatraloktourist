const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get audit logs with filters
 * @route   GET /api/audit
 * @access  Admin
 */
const getAuditLogs = async (req, res) => {
  try {
    const { category, action, userId, status, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (action) query.action = { $regex: action, $options: 'i' };
    if (userId) query.user = userId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email digitalId role');

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get audit log by ID
 * @route   GET /api/audit/:id
 * @access  Admin
 */
const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('user', 'name email digitalId role');

    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get audit log summary/stats
 * @route   GET /api/audit/stats/summary
 * @access  Admin
 */
const getAuditStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    // Actions by category
    const byCategory = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Actions by status
    const byStatus = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top actions
    const topActions = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    // Activity timeline
    const timeline = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Most active users
    const activeUsers = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: since }, user: { $ne: null } } },
      {
        $group: {
          _id: '$user',
          actions: { $sum: 1 },
        },
      },
      { $sort: { actions: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          actions: 1,
          'userInfo.name': 1,
          'userInfo.email': 1,
          'userInfo.role': 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byCategory,
        byStatus,
        topActions,
        timeline,
        mostActiveUsers: activeUsers,
        periodDays: parseInt(days),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete old audit logs
 * @route   DELETE /api/audit/cleanup
 * @access  Admin
 */
const cleanupAuditLogs = async (req, res) => {
  try {
    const { olderThanDays = 90 } = req.body;
    const cutoffDate = new Date(Date.now() - parseInt(olderThanDays) * 24 * 60 * 60 * 1000);

    const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoffDate } });

    await AuditLog.log({
      user: req.user._id,
      action: 'audit_cleanup',
      category: 'system',
      description: `Cleaned up ${result.deletedCount} audit logs older than ${olderThanDays} days`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} audit logs older than ${olderThanDays} days`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  cleanupAuditLogs,
};
