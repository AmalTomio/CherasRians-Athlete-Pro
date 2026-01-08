const mongoose = require("mongoose");

const damageReportSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
    },
    quantityDamaged: {
      type: Number,
      required: true,
      min: 1,
    },
    damageDescription: String,
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    images: [{ type: String }], // store uploaded file paths

    status: {
      type: String,
      enum: ["reported",  "resolved"],
      default: "reported",
      index: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    resolvedAt: Date,

    resolutionType: {
      type: String,
      enum: ["repaired", "replaced"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EquipmentDamageReport", damageReportSchema);
