const EmergencyContact = require('../models/EmergencyContact');
const AuditLog = require('../models/AuditLog');
const { EMERGENCY_CONTACTS } = require('../config/constants');

/**
 * @desc    Get all system emergency contacts
 * @route   GET /api/contacts/system
 * @access  Public
 */
const getSystemContacts = async (req, res) => {
  try {
    const systemContacts = await EmergencyContact.find({
      category: 'system',
      isActive: true,
    }).sort({ isPriority: -1, type: 1 });

    // Merge with hardcoded constants as fallback
    const fallbackContacts = EMERGENCY_CONTACTS.map((c) => ({
      name: c.name,
      phone: c.number,
      type: c.type,
      category: 'system',
      isActive: true,
      availableHours: '24/7',
    }));

    const contacts = systemContacts.length > 0 ? systemContacts : fallbackContacts;

    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get user's personal emergency contacts
 * @route   GET /api/contacts/my
 * @access  Private
 */
const getMyContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({
      user: req.user._id,
      category: 'user-defined',
    }).sort({ isPriority: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Add personal emergency contact
 * @route   POST /api/contacts
 * @access  Private
 */
const addContact = async (req, res) => {
  try {
    const { name, phone, email, type, description, isPriority } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required',
      });
    }

    const contact = await EmergencyContact.create({
      name,
      phone,
      email: email || '',
      type: type || 'personal',
      category: 'user-defined',
      user: req.user._id,
      description: description || '',
      isPriority: isPriority || false,
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add contact', error: error.message });
  }
};

/**
 * @desc    Update emergency contact
 * @route   PUT /api/contacts/:id
 * @access  Private
 */
const updateContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    const allowedFields = ['name', 'phone', 'email', 'type', 'description', 'isPriority', 'isActive'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        contact[field] = req.body[field];
      }
    }

    await contact.save();

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete emergency contact
 * @route   DELETE /api/contacts/:id
 * @access  Private
 */
const deleteContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.status(200).json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get zone-specific emergency contacts
 * @route   GET /api/contacts/zone/:zoneId
 * @access  Public
 */
const getZoneContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({
      zone: req.params.zoneId,
      category: 'zone-specific',
      isActive: true,
    }).sort({ isPriority: -1 });

    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Admin: Create system/zone-specific contact
 * @route   POST /api/contacts/admin
 * @access  Admin
 */
const createAdminContact = async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      category: req.body.category || 'system',
    };

    const contact = await EmergencyContact.create(contactData);

    await AuditLog.log({
      user: req.user._id,
      action: 'contact_created',
      category: 'admin',
      description: `Admin created ${contactData.category} contact: ${contact.name}`,
      resourceType: 'EmergencyContact',
      resourceId: contact._id,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Admin: Get all contacts
 * @route   GET /api/contacts/admin/all
 * @access  Admin
 */
const getAllContactsAdmin = async (req, res) => {
  try {
    const { category, type, page = 1, limit = 50 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (type) query.type = type;

    const contacts = await EmergencyContact.find(query)
      .sort({ category: 1, isPriority: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email')
      .populate('zone', 'name type');

    const total = await EmergencyContact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: contacts,
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

module.exports = {
  getSystemContacts,
  getMyContacts,
  addContact,
  updateContact,
  deleteContact,
  getZoneContacts,
  createAdminContact,
  getAllContactsAdmin,
};
