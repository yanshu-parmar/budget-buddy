const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
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
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  categories: [{
    category: {
      type: String,
      required: true
    },
    limit: {
      type: Number,
      required: true
    },
    spent: {
      type: Number,
      default: 0
    }
  }],
  totalBudget: {
    type: Number,
    required: true
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      default: 80 // Percentage
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
budgetSchema.index({ user: 1, startDate: -1 });
budgetSchema.index({ user: 1, isActive: 1 });

// Method to calculate remaining budget
budgetSchema.methods.getRemainingBudget = function() {
  return this.totalBudget - this.totalSpent;
};

// Method to calculate category spending percentage
budgetSchema.methods.getCategorySpendingPercentage = function(category) {
  const categoryBudget = this.categories.find(c => c.category === category);
  if (!categoryBudget) return 0;
  return (categoryBudget.spent / categoryBudget.limit) * 100;
};

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget; 