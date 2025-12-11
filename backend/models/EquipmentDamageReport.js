// backend/models/EquipmentDamageReport.js
const mongoose = require("mongoose");

const damageReportSchema = new mongoose.Schema(
  {
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment", required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    quantityDamaged: { type: Number, required: true, min: 1 },
    damageDescription: { type: String },
    severity: { type: String, enum: ["low", "medium", "high"], default: "low" },
    status: { type: String, enum: ["reported", "investigating", "resolved"], default: "reported" },
    notes: { type: String },
  },
  { timestamps: true }
);

damageReportSchema.index({ equipmentId: 1 });
damageReportSchema.index({ reportedBy: 1 });

module.exports = mongoose.model("EquipmentDamageReport", damageReportSchema);
