// backend/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required:true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["caregiver", "senior"],
    required: true,
  },

  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("User", userSchema);