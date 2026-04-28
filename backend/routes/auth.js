// backend/routes/auth.js

const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");

const router = express.Router();

// ── REGISTER ─────────────────────────────────────────────
// POST /api/auth/register
// For seniors: also accepts caregiverEmail to link them

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, caregiverEmail } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check email not already taken
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let caregiverId = null;

    // If registering as senior, find and link the caregiver
    if (role === "senior") {
      if (!caregiverEmail) {
        return res.status(400).json({ message: "Please enter your caregiver's email" });
      }

      // Look for a caregiver with that email
      const caregiver = await User.findOne({ email: caregiverEmail, role: "caregiver" });
      if (!caregiver) {
        return res.status(400).json({ message: "No caregiver found with that email. Ask your caregiver to register first." });
      }

      caregiverId = caregiver._id;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      caregiverId, // null for caregivers, caregiver's _id for seniors
    });

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id:          user._id,
        name:        user.name,
        email:       user.email,
        role:        user.role,
        caregiverId: user.caregiverId, // send this to frontend
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────
// POST /api/auth/login

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.role !== role) {
      return res.status(400).json({ message: `This account is registered as a ${user.role}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id:          user._id,
        name:        user.name,
        email:       user.email,
        role:        user.role,
        caregiverId: user.caregiverId, // important — senior needs this
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;