const SystemSettings = require('../models/systemSettings.model');
const AuditLog = require('../models/auditLog.model');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const Budget = require('../models/budget.model');
const Goal = require('../models/goal.model');
const mongoose = require('mongoose');

// Get system settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update system settings
exports.updateSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findOneAndUpdate(
      {},
      { ...req.body, updatedBy: req.user._id },
      { new: true, upsert: true }
    );

    await AuditLog.create({
      type: 'SYSTEM',
      user: req.user._id,
      action: 'UPDATE_SETTINGS',
      details: 'System settings updated',
      severity: 'INFO',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get active users (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // Get total transactions
    const totalTransactions = await Transaction.countDocuments();

    // Get recent activity
    const recentActivity = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('user', 'name email');

    // Get system health information
    const systemHealth = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: {
        total: process.memoryUsage().heapTotal,
        used: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss
      },
      database: {
        status: 'connected',
        collections: await Promise.all([
          User.countDocuments(),
          Transaction.countDocuments(),
          Budget.countDocuments(),
          Goal.countDocuments(),
          AuditLog.countDocuments()
        ]).then(([users, transactions, budgets, goals, logs]) => ({
          users,
          transactions,
          budgets,
          goals,
          logs
        }))
      },
      api: {
        status: 'operational',
        responseTime: Date.now() - req._startTime,
        endpoints: {
          total: 15, // Update this based on your actual API endpoints
          active: 15
        }
      },
      lastChecked: new Date()
    };

    // Check for potential issues
    const issues = [];
    
    // Check memory usage
    const memoryUsagePercent = (systemHealth.memory.used / systemHealth.memory.total) * 100;
    if (memoryUsagePercent > 80) {
      issues.push({
        type: 'memory',
        severity: 'warning',
        message: `High memory usage: ${memoryUsagePercent.toFixed(2)}%`
      });
      systemHealth.status = 'warning';
    }

    // Check database connection
    try {
      await mongoose.connection.db.admin().ping();
    } catch (error) {
      issues.push({
        type: 'database',
        severity: 'critical',
        message: 'Database connection issue'
      });
      systemHealth.status = 'critical';
      systemHealth.database.status = 'disconnected';
    }

    // Check API response time
    if (systemHealth.api.responseTime > 1000) {
      issues.push({
        type: 'api',
        severity: 'warning',
        message: `Slow API response time: ${systemHealth.api.responseTime}ms`
      });
      if (systemHealth.status !== 'critical') {
        systemHealth.status = 'warning';
      }
    }

    systemHealth.issues = issues;

    res.json({
      totalUsers,
      activeUsers,
      totalTransactions,
      recentActivity,
      systemHealth
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error getting dashboard statistics' });
  }
};

// Get audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { type, severity, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email'),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get users for management
exports.getUsers = async (req, res) => {
  try {
    const { search, status, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.isActive = status === 'active';
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await AuditLog.create({
      type: 'USER',
      user: req.user._id,
      action: 'UPDATE_STATUS',
      details: `User status updated to ${status}`,
      severity: 'INFO',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 