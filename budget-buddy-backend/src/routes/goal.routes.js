const express = require('express');
const router = express.Router();
const Goal = require('../models/goal.model');
const { auth } = require('../middleware/auth.middleware');

// Get all goals for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id })
      .sort({ targetDate: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new goal
router.post('/', auth, async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      user: req.user._id
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific goal
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a goal
router.patch('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    Object.assign(goal, req.body);
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete all goals for the current user
router.delete('/', auth, async (req, res) => {
  try {
    const result = await Goal.deleteMany({ user: req.user._id });
    res.json({ message: `Deleted ${result.deletedCount} goals successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get goals by status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.user._id,
      status: req.params.status
    }).sort({ targetDate: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update goal progress
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.currentAmount += amount;
    
    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add milestone to goal
router.post('/:id/milestones', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.milestones.push(req.body);
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 