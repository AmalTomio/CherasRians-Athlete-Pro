// backend/models/EquipmentRequest.js
const mongoose = require("mongoose");

const equipmentRequestSchema = new mongoose.Schema(
  {
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment", required: true },
    quantityRequested: { type: Number, required: true, min: 1 },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" }, // optional link to booking
    reason: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected", "partially_approved"], default: "pending" },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    processedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

equipmentRequestSchema.index({ coachId: 1 });
equipmentRequestSchema.index({ equipmentId: 1 });
equipmentRequestSchema.index({ status: 1 });

module.exports = mongoose.model("EquipmentRequest", equipmentRequestSchema);
