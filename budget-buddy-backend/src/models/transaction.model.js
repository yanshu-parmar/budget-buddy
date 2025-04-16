const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    set: function(date) {
      // Handle both string and Date objects
      if (typeof date === 'string') {
        return new Date(date);
      }
      return date;
    }
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', null],
    required: function() {
      return this.isRecurring === true;
    },
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    type: String // URLs to attached files
  }]
}, {
  timestamps: true
});

// Index for efficient querying
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 