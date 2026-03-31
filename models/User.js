const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  dateOfBirth: { type: String }, // Format: YYYY-MM-DD or similar
  // Admin specific (optional for normal customers)
  username: { type: String, sparse: true, unique: true }, 
  password: { type: String }, 
  role: {
    type: String,
    enum: ["admin", "customer"],
    default: "customer"
  },
  otp: { type: String },
  otpExpires: { type: Date },
  lastVisit: { type: Date, default: Date.now },
  lastOrderDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving if present
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
