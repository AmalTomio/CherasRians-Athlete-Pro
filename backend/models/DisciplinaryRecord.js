// models/DisciplinaryRecord.js
const mongoose = require("mongoose");

const disciplinarySchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  source: {
    type: String,
    enum: ["attendance", "manual"],
    default: "attendance",
  },

  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

  violationType: {
    type: String,
    enum: ["Absent", "Late", "Misconduct"],
    required: true,
  },

  points: { type: Number, default: 1 },

  notes: String,
}, { timestamps: true });

disciplinarySchema.index({ playerId: 1, createdAt: -1 });