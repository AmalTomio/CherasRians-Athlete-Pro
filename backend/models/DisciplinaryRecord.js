// models/DisciplinaryRecord.js
const mongoose = require("mongoose");

const disciplinarySchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  sport: {
    type: String,
    required: true,
    index: true,
  },

  category: {
    type: String,
    enum: ["U-15", "U-18"],
    required: true,
    index: true,
  },

  type: {
    type: String,
    enum: ["AUTO", "MANUAL"],
    required: true,
  },

  reason: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },

  status: {
    type: String,
    enum: ["open", "resolved"],
    default: "open",
    index: true,
  },

  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attendance",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("DisciplinaryCase", disciplinarySchema);