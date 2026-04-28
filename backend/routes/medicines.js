// backend/routes/medicines.js
// Handles: add medicine, get medicines for a senior, mark as taken

const express     = require("express");
const Medicine    = require("../models/Medicine");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// ── ADD MEDICINE ─────────────────────────────────────────
// POST /api/medicines/add
// Only caregivers add medicines
// Frontend sends: { seniorId, name, dosage, time, date }

router.post("/add", verifyToken, async (req, res) => {
  try {
    const { seniorId, name, dosage, time, date } = req.body;

    if (!seniorId || !name || !dosage || !time || !date) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Create a new medicine document in MongoDB
    const medicine = await Medicine.create({
      seniorId,
      name,
      dosage,
      time,
      date,
      taken: false,
    });

    res.status(201).json({ message: "Medicine added", medicine });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET MEDICINES FOR A SENIOR ───────────────────────────
// GET /api/medicines/:seniorId/:date
// Both senior and caregiver can view

router.get("/:seniorId/:date", verifyToken, async (req, res) => {
  try {
    const { seniorId, date } = req.params;

    // Find all medicines for this senior on this date
    // .sort({ time: 1 }) sorts them in order of time
    const medicines = await Medicine.find({ seniorId, date }).sort({ time: 1 });

    res.json(medicines);

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── MARK MEDICINE AS TAKEN ───────────────────────────────
// PUT /api/medicines/taken/:id
// Senior marks their medicine as taken

router.put("/taken/:id", verifyToken, async (req, res) => {
  try {
    // findByIdAndUpdate finds the medicine by its MongoDB _id
    // { taken: true } is the update
    // { new: true } means return the updated document, not the old one
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { taken: true },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json({ message: "Marked as taken", medicine });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;