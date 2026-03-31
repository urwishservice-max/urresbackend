const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT Helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: '30d' }
  );
};

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

    // Default admin check
    if (username === "admin" && password === "admin123") {
      let admin = await User.findOne({ username: "admin" });
      if (!admin) {
        admin = new User({ name: "Restaurant Admin", phone: "0000000000", username: "admin", password: "admin123", role: "admin" });
        await admin.save();
      }
      const token = generateToken(admin);
      return res.json({ status: "success", user: admin, token });
    }

    const admin = await User.findOne({ username, role: "admin" });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(admin);
    res.json({ status: "success", user: admin, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 1: Send OTP (Signup ONLY)
router.post('/customer/send-otp', async (req, res) => {
  try {
    const { phone, name, dob } = req.body;
    if (!phone || !name || !dob) {
      return res.status(400).json({ error: "Name, Phone, and Date of Birth are required for registration" });
    }

    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ error: "User already exists. Please Login." });
    }

    // Create temporary user or just send OTP
    // For now, we update/create with a flag or just use the same logic but enforce fields
    user = new User({ name, phone, dateOfBirth: dob, role: "customer" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // WHATSAPP TRIGGER: Signup OTP
    const { sendWhatsApp } = require('../utils/whatsapp');
    await sendWhatsApp(phone, `🔐 *UrWish OTP*: Your One-Time Password for signup is *${otp}*. \n\nValid for 5 minutes. Please do not share this with anyone! 🎁`);

    res.json({ status: "success", message: "OTP sent successfully to your WhatsApp!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Direct Login (No OTP)
router.post('/customer/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });

    const user = await User.findOne({ phone, role: "customer" });
    if (!user) {
      return res.status(404).json({ error: "User not found. Please Sign Up." });
    }

    const token = generateToken(user);

    // WHATSAPP TRIGGER: Login Welcome
    const { sendWhatsApp } = require('../utils/whatsapp');
    user.lastVisit = new Date();
    await user.save();
    sendWhatsApp(user.phone, `👋 Welcome back to UrWish, ${user.name}! We're happy to see you again. Check out today's specials! 🍲`);

    res.json({ status: "success", user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 2: Verify OTP & Login
router.post('/customer/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP required" });

    const user = await User.findOne({ 
      phone, 
      otp, 
      otpExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP after successful use
    user.otp = undefined;
    user.otpExpires = undefined;
    
    // WHATSAPP TRIGGER: Signup Welcome
    const { sendWhatsApp } = require('../utils/whatsapp');
    sendWhatsApp(user.phone, `🎉 Welcome to UrWish Restaurant, ${user.name}! Thank you for joining our family. We can't wait to serve you your first meal! 🍽️`);
    
    await user.save();

    const token = generateToken(user);
    res.json({ status: "success", user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
