const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, default: "" },
  image: { type: String },
  isAvailable: { type: Boolean, default: true }, // Out of stock toggle
  isVisible: { type: Boolean, default: true },   // Hidden from customer toggle
  stock: { type: Number, default: 10 },
  
  // Promotions
  isFeatured: { type: Boolean, default: false },
  isFavourite: { type: Boolean, default: false },
  isTodaysSpecial: { type: Boolean, default: false },
  
  // Stats & Sorting
  orderCount: { type: Number, default: 0 },
  displayOrder: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Menu", menuSchema);
