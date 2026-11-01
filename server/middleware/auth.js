const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Reads "Authorization: Bearer <token>", verifies it, and attaches the user to req.
exports.protect = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please log in" });
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ message: "User no longer exists" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Session expired, please log in again" });
  }
};

// Role-based access control: allow("seller") blocks everyone else.
exports.allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ message: `Only ${roles.join("/")} accounts can do this` });
