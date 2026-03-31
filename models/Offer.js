const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  image: String,
  rate: String,
  type: { type: String, enum: ['CUSTOM', 'ANNOUNCEMENT'], default: 'CUSTOM' },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Offer', offerSchema);
