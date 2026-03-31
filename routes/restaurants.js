const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Get restaurant info (Single restaurant)
router.get('/', async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne();
    if (!restaurant) {
      restaurant = new Restaurant(); // Create default if not exists
      await restaurant.save();
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single restaurant
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/Owner: Create restaurant
router.post('/', authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const { name, address, image, openingTime, closingTime, category } = req.body;
    const restaurant = new Restaurant({
      name,
      address,
      image,
      openingTime,
      closingTime,
      category
    });
    await restaurant.save();
    
    res.json({ status: "created", restaurant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update restaurant status/info
router.put('/:id', authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: Date.now() }, 
      { new: true, runValidators: true }
    );
    
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    res.json({ status: "updated", restaurant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
