const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: { type: String, default: "Urwish Restaurant" },
  logo: { type: String, default: "" },
  location: {
    lat: { type: Number, default: 13.0827 },
    lng: { type: Number, default: 80.2707 }
  },
  isOpen: { type: Boolean, default: true },
  openingTime: { type: String, default: "09:00" },
  closingTime: { type: String, default: "22:00" },
  closedMessage: { type: String, default: "We are currently closed. Please visit us during opening hours!" },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
