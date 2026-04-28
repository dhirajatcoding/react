// backend/models/Medicine.js
// Blueprint for a medicine document in MongoDB

const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({

  seniorId: {
    type: mongoose.Schema.Types.ObjectId,  // references a User document
    ref: "User",                            // tells mongoose it links to User model
    required: true,
  },

  name: {
    type: String,
    required: true,   // e.g. "Aspirin"
  },

  dosage: {
    type: String,
    required: true,   // e.g. "500mg"
  },

  time: {
    type: String,
    required: true,   // e.g. "8:00 AM"
  },

  taken: {
    type: Boolean,
    default: false,   // starts as not taken, senior marks it true
  },

  date: {
    type: String,
    required: true,   // e.g. "2025-04-18" — which day this medicine is for
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("Medicine", medicineSchema);