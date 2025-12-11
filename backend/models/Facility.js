// backend/models/Facility.js
const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["available", "booked", "maintenance"], default: "available" },
    capacity: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Facility", facilitySchema);
