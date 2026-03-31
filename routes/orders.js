const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Menu = require('../models/Menu');

// Get all orders (Kitchen Dashboard) - sorted by latest
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order for tracking
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer's own orders
router.get('/customer/my-orders', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: "Phone number required" });
    
    const orders = await Order.find({ "customer.phone": phone }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (Legacy)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('order_status_updated', order);

    res.json({ status: "updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order (General - used by Dashboard/Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(id, { ...req.body }, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('order_status_updated', order);

    res.json({ status: "updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place Order
router.post('/', async (req, res) => {
  try {
    const { customer, tableNumber, items, totalAmount } = req.body;
    if (!customer || !tableNumber || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing order details" });
    }

    // Check stock and decrement
    for (const item of items) {
      const menuId = item.menuId;
      const q = item.quantity;
      const menuItem = await Menu.findById(menuId);
      if (!menuItem) return res.status(404).json({ error: `Dish not found: ${item.name}` });
      if (menuItem.stock < q) return res.status(400).json({ error: `Out of stock: ${item.name}` });

      menuItem.stock -= q;
      // Auto mark unavailable if stock hits 0
      if (menuItem.stock <= 0) {
        menuItem.isAvailable = false;
      }
      await menuItem.save();
    }

    // CHECK BIRTHDAY ORDER
    const User = require('../models/User');
    const user = await User.findOne({ 
      $or: [
        { phone: customer.phone },
        { phone: customer.phone.replace(/\D/g, '') },
        { phone: '91' + customer.phone.replace(/\D/g, '') }
      ]
    });
    
    let isBirthdayOrder = false;
    if (user && user.dateOfBirth) {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      // Format 03-30 (MM-DD)
      if (user.dateOfBirth.includes(`${month}-${day}`)) {
        isBirthdayOrder = true;
      }
    }

    const order = new Order({ customer, tableNumber, items, totalAmount, isBirthdayOrder });
    await order.save();

    // WHATSAPP TRIGGER: Order Confirmation & Feedback
    if (user) {
      user.lastOrderDate = new Date();
      await user.save();
    }

    const { sendWhatsApp } = require('../utils/whatsapp');
    const deployedUrl = process.env.DEPLOYED_URL || "https://urwish.com";
    sendWhatsApp(customer.phone, `✅ Order Confirmed! Thank you for ordering from UrWish. \n\nTotal: ₹${totalAmount}\n\nWe'd love to hear your feedback! Please rate us here: ${deployedUrl}/feedback?order=${order._id} 🌟`);

    const io = req.app.get('io');
    io.emit('new_order', order);

    res.json({ status: "success", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel Order (User-initiated)
router.patch('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    // Only allow cancel if Pending/Confirmed
    if (['Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ error: `Cannot cancel an order that is already ${order.status}` });
    }

    order.status = 'Cancelled';
    await order.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('order_status_updated', order);

    res.json({ status: "success", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Analytics: Popular Dishes
router.get('/analytics/popular', async (req, res) => {
  try {
    const popularDishes = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", count: { $sum: "$items.quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(popularDishes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Get Orders by Restaurant (for React Dashboard compatibility)
router.get('/restaurant/:id', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics: Popular Dishes by Restaurant (for React Dashboard compatibility)
router.get('/analytics/popular/:id', async (req, res) => {
  try {
    const popular = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", count: { $sum: "$items.quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    res.json(popular);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

