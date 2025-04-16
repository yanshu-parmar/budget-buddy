const express = require('express');
const router = express.Router();
const Budget = require('../models/budget.model');
const { auth } = require('../middleware/auth.middleware');

// Get all budgets for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id })
      .sort({ startDate: -1 });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new budget
router.post('/', auth, async (req, res) => {
  try {
    const budget = new Budget({
      ...req.body,
      user: req.user._id
    });
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific budget
router.get('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a budget
router.patch('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    Object.assign(budget, req.body);
    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a budget
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active budgets
router.get('/status/active', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.user._id,
      isActive: true
    }).sort({ startDate: -1 });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update budget category spending
router.patch('/:id/category/:category/spent', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const category = budget.categories.find(c => c.category === req.params.category);
    if (!category) {
      return res.status(404).json({ message: 'Category not found in budget' });
    }

    category.spent += amount;
    budget.totalSpent += amount;
    await budget.save();

    res.json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 