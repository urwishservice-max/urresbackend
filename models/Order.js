const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true }
  },
  tableNumber: { type: String, required: true },
  items: [
    {
      menuId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Order Placed", "Preparing", "Ready", "Completed", "Paid"],
    default: "Order Placed"
  },
  isBirthdayOrder: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
