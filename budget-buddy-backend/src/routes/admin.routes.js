const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const AuditLog = require('../models/auditLog.model');
const SystemSettings = require('../models/systemSettings.model');
const adminController = require('../controllers/admin.controller');

// Get dashboard statistics
router.get('/dashboard', auth, adminAuth, adminController.getDashboardStats);

// Get audit logs
router.get('/audit-logs', auth, adminAuth, adminController.getAuditLogs);

// Get system settings
router.get('/settings', auth, adminAuth, adminController.getSettings);

// Update system settings
router.put('/settings', auth, adminAuth, adminController.updateSettings);

// Get user statistics
router.get('/users/stats', auth, adminAuth, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transaction statistics
router.get('/transactions/stats', auth, adminAuth, async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user management data
router.get('/users', auth, adminAuth, adminController.getUsers);

// Update user status
router.patch('/users/:userId/status', auth, adminAuth, adminController.updateUserStatus);

module.exports = router; 