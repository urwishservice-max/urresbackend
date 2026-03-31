const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const User = require('../models/User');
const { sendWhatsApp } = require('../utils/whatsapp');

// Helper to broadcast offer to all users
async function broadcastOfferWhatsApp(offer) {
  try {
    const deployedUrl = process.env.DEPLOYED_URL || "https://urwish.com";
    const users = await User.find({ phone: { $exists: true } });
    console.log(`[Offer Broadcast] Sending to ${users.length} users...`);
    
    for (const user of users) {
      await sendWhatsApp(user.phone, `🎉 *NEW OFFER FROM URWISH*! 🎉 \n\n*${offer.title}* \n${offer.message} \n\nDon't miss out! Order now: ${deployedUrl} 🚀`);
    }
  } catch (err) {
    console.error("[Offer Broadcast Error]:", err.message);
  }
}

// Get all offers
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active offer
router.get('/active', async (req, res) => {
  try {
    const offer = await Offer.findOne({ isActive: true }).populate('itemId');
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create offer
router.post('/', async (req, res) => {
  try {
    // If new offer is active, deactivate others
    if (req.body.isActive) {
      await Offer.updateMany({}, { isActive: false });
    }

    const offer = new Offer(req.body);
    await offer.save();
    
    // Populate for socket
    await offer.populate('itemId');

    // Emit via socket if active
    // WHATSAPP BROADCAST (New Offer)
    // WHATSAPP BROADCAST (New Offer)
    if (offer.isActive) {
      broadcastOfferWhatsApp(offer); // Run in background
    }

    res.status(201).json(offer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update/Toggle offer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // If making this one active, deactivate all others
    if (isActive) {
      await Offer.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    const offer = await Offer.findByIdAndUpdate(id, req.body, { new: true }).populate('itemId');
    
    // Emit via socket/WhatsApp if activated
    const io = req.app.get('io');
    if (isActive) {
      io.emit('push_offer', offer);
      broadcastOfferWhatsApp(offer); // New: Trigger WhatsApp on toggle active
    } else {
      io.emit('hide_offer'); // Signal to hide current offer
    }

    res.json(offer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete offer
router.delete('/:id', async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: "Offer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
