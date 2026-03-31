const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendWhatsApp } = require('../utils/whatsapp');

// Admin Broadcast: Send to ALL or Specific
router.post('/broadcast', async (req, res) => {
  try {
    const { target, phone, message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    if (target === 'all') {
      const users = await User.find({ role: 'customer' });
      let successCount = 0;
      let failCount = 0;

      for (const user of users) {
        try {
          await sendWhatsApp(user.phone, message);
          successCount++;
        } catch (err) {
          console.error(`Broadcast failed for ${user.phone}`);
          failCount++;
          // If total failure (like channel missing), stop immediately
          if (err.response?.data?.error === 'Channel not found') {
             return res.status(400).json({ error: "WhatsApp Channel not connected! Link your phone in Whapi dashboard." });
          }
        }
      }
      return res.json({ status: "success", count: successCount, failed: failCount });
    }

    if (target === 'specific') {
      if (!phone) return res.status(400).json({ error: "Phone number is required for specific broadcast" });
      await sendWhatsApp(phone, message);
      return res.json({ status: "success", target: phone });
    }

    res.status(400).json({ error: "Invalid target" });
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    res.status(500).json({ error: errorMsg });
  }
});

module.exports = router;
