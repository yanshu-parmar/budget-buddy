const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction.model');
const { auth } = require('../middleware/auth.middleware');

// Get all transactions for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, category, description, date, isRecurring, recurringFrequency, tags, attachments } = req.body;

    // Validate required fields
    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'Type, amount, and category are required' });
    }

    // Create transaction data object
    const transactionData = {
      user: req.user.id,
      type,
      amount,
      category,
      description,
      date: date ? new Date(date) : new Date(),
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? (recurringFrequency || 'monthly') : null,
      tags,
      attachments
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
});

// Get a specific transaction
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a transaction
router.patch('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    Object.assign(transaction, req.body);
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get transactions by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
      category: req.params.category
    }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions by category:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get transactions by date range
router.get('/date-range', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const transactions = await Transaction.find({
      user: req.user._id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 