const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: 'Budget Buddy'
  },
  supportEmail: {
    type: String,
    required: true
  },
  maxFileSize: {
    type: Number,
    required: true,
    default: 5 // in MB
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  defaultCurrency: {
    type: String,
    required: true,
    default: 'USD'
  },
  sessionTimeout: {
    type: Number,
    required: true,
    default: 30 // in minutes
  },
  emailSettings: {
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPass: String,
    fromEmail: String,
    fromName: String
  },
  securitySettings: {
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    passwordExpiryDays: {
      type: Number,
      default: 90
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Update the updatedAt timestamp before saving
systemSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema); 