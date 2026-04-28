// backend/models/Task.js
// Blueprint for a task document in MongoDB

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({

  seniorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,   // which senior this task belongs to
  },

  description: {
    type: String,
    required: true,   // e.g. "Morning walk"
  },

  assignedTo: {
    type: String,
    required: true,   // name of person responsible e.g. "Margaret" or "Self"
  },

  completed: {
    type: Boolean,
    default: false,   // starts incomplete, marked true when done
  },

  date: {
    type: String,
    required: true,   // which day this task is for
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("Task", taskSchema);