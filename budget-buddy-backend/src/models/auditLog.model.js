const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'SETTINGS_UPDATE',
      'TRANSACTION_CREATE',
      'TRANSACTION_UPDATE',
      'TRANSACTION_DELETE',
      'BUDGET_CREATE',
      'BUDGET_UPDATE',
      'BUDGET_DELETE',
      'GOAL_CREATE',
      'GOAL_UPDATE',
      'GOAL_DELETE'
    ]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  severity: {
    type: String,
    required: true,
    enum: ['INFO', 'WARNING', 'ERROR'],
    default: 'INFO'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

module.exports = mongoose.model('AuditLog', auditLogSchema); 