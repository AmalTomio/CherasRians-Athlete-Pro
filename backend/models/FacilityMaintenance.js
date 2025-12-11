// backend/models/FacilityMaintenance.js
const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    excoId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FacilityMaintenance", maintenanceSchema);
