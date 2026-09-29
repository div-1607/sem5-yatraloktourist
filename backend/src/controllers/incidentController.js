const Incident = require('../models/Incident');
const Zone = require('../models/Zone');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Report a new incident
 * @route   POST /api/incidents
 * @access  Private
 */
const reportIncident = async (req, res) => {
  try {
    const {
      title, description, type, severity, location,
      zone, affectedCount, evidence, tags,
    } = req.body;

    const incident = await Incident.create({
      title,
      description,
      type,
      severity,
      location,
      zone,
      affectedCount,
      evidence,
      tags,
      reportedBy: req.user._id,
    });

    await AuditLog.log({
      user: req.user._id,
      action: 'incident_reported',
      category: 'incident',
      description: `Reported incident: ${title} (${type} - ${severity})`,
      resourceType: 'Incident',
      resourceId: incident._id,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to report incident', error: error.message });
  }
};

/**
 * @desc    Get all incidents with filters
 * @route   GET /api/incidents
 * @access  Admin
 */
const getAllIncidents = async (req, res) => {
  try {
    const { type, severity, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const incidents = await Incident.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('reportedBy', 'name email digitalId')
      .populate('assignedTo', 'name email')
      .populate('zone', 'name type');

    const total = await Incident.countDocuments(query);

    // Get summary stats
    const stats = await Incident.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: incidents,
      stats: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
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
 * @desc    Get incident by ID
 * @route   GET /api/incidents/:id
 * @access  Private
 */
const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email digitalId mobile')
      .populate('assignedTo', 'name email')
      .populate('zone', 'name type alertLevel')
      .populate('relatedSOS')
      .populate('responseLog.responder', 'name email');

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    res.status(200).json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update incident (assign, change status, add response)
 * @route   PUT /api/incidents/:id
 * @access  Admin
 */
const updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const allowedFields = [
      'title', 'description', 'type', 'severity', 'status',
      'assignedTo', 'affectedCount', 'isPublic', 'tags',
      'resolutionSummary',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        incident[field] = req.body[field];
      }
    }

    // Set resolution timestamp
    if (req.body.status === 'resolved' && !incident.resolvedAt) {
      incident.resolvedAt = new Date();
    }

    await incident.save();

    await AuditLog.log({
      user: req.user._id,
      action: 'incident_updated',
      category: 'incident',
      description: `Updated incident #${incident._id} status to: ${incident.status}`,
      resourceType: 'Incident',
      resourceId: incident._id,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Add response log entry to incident
 * @route   POST /api/incidents/:id/response
 * @access  Admin
 */
const addResponseLog = async (req, res) => {
  try {
    const { action, notes } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    incident.responseLog.push({
      responder: req.user._id,
      action,
      notes: notes || '',
      timestamp: new Date(),
    });

    // Auto-update status to 'responding' if still reported
    if (incident.status === 'reported') {
      incident.status = 'acknowledged';
    }

    await incident.save();

    res.status(200).json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete incident
 * @route   DELETE /api/incidents/:id
 * @access  Admin
 */
const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    await AuditLog.log({
      user: req.user._id,
      action: 'incident_deleted',
      category: 'incident',
      resourceType: 'Incident',
      resourceId: incident._id,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Incident deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get user's reported incidents
 * @route   GET /api/incidents/my
 * @access  Private
 */
const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('zone', 'name type');

    res.status(200).json({ success: true, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  reportIncident,
  getAllIncidents,
  getIncidentById,
  updateIncident,
  addResponseLog,
  deleteIncident,
  getMyIncidents,
};
