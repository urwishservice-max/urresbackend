const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/authMiddleware');

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, dateOfBirth } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    await user.save();
    
    // Return sanitized user object
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
