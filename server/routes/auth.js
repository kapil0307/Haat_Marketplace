const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: "This email is already registered" });

    const hash = await bcrypt.hash(password, 10); // never store the plain password
    const user = await User.create({
      name,
      email,
      password: hash,
      role: role === "seller" ? "seller" : "buyer",
    });
    res.status(201).json({ token: sign(user._id), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() }).select("+password");
    const ok = user && (await bcrypt.compare(password || "", user.password));
    if (!ok) return res.status(401).json({ message: "Wrong email or password" });
    res.json({ token: sign(user._id), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
