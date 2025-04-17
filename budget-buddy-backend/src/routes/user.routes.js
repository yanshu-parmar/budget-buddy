const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { auth, adminAuth } = require('../middleware/auth.middleware');

// Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID (admin only)
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user (admin only)
router.patch('/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent updating password through this route
    delete req.body.password;
    
    Object.assign(user, req.body);
    await user.save();
    
    res.json({ 
      message: 'User updated successfully',
      user: user.toObject({ hide: 'password' })
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Block/Unblock user (admin only)
router.patch('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ 
      message: `User ${isActive ? 'unblocked' : 'blocked'} successfully`,
      user: user.toObject({ hide: 'password' })
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalUsers,
      activeUsers,
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search users (admin only)
router.get('/search', auth, adminAuth, async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { email: new RegExp(query, 'i') },
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') }
      ]
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 