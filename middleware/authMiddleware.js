const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ error: "Invalid token. User not found." });

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. You do not have the required permissions." });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
