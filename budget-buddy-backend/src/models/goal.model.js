const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['savings', 'debt', 'investment', 'purchase'],
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  description: {
    type: String,
    trim: true
  },
  milestones: [{
    amount: Number,
    date: Date,
    description: String,
    achieved: {
      type: Boolean,
      default: false
    }
  }],
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, targetDate: 1 });

// Method to calculate progress percentage
goalSchema.methods.getProgress = function() {
  return (this.currentAmount / this.targetAmount) * 100;
};

// Method to check if goal is on track
goalSchema.methods.isOnTrack = function() {
  const today = new Date();
  const totalDays = (this.targetDate - this.startDate) / (1000 * 60 * 60 * 24);
  const daysElapsed = (today - this.startDate) / (1000 * 60 * 60 * 24);
  const expectedProgress = (daysElapsed / totalDays) * 100;
  return this.getProgress() >= expectedProgress;
};

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal; 