// backend/routes/tasks.js
// Handles: add task, get tasks, mark task complete

const express     = require("express");
const Task        = require("../models/Task");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// ── ADD TASK ─────────────────────────────────────────────
// POST /api/tasks/add
// Caregiver adds a task for a senior
// Frontend sends: { seniorId, description, assignedTo, date }

router.post("/add", verifyToken, async (req, res) => {
  try {
    const { seniorId, description, assignedTo, date } = req.body;

    if (!seniorId || !description || !assignedTo || !date) {
      return res.status(400).json({ message: "All fields required" });
    }

    const task = await Task.create({
      seniorId,
      description,
      assignedTo,
      date,
      completed: false,
    });

    res.status(201).json({ message: "Task added", task });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET TASKS FOR A SENIOR ───────────────────────────────
// GET /api/tasks/:seniorId/:date

router.get("/:seniorId/:date", verifyToken, async (req, res) => {
  try {
    const { seniorId, date } = req.params;

    const tasks = await Task.find({ seniorId, date });

    res.json(tasks);

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── MARK TASK COMPLETE ───────────────────────────────────
// PUT /api/tasks/complete/:id

router.put("/complete/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: true },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task completed", task });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;