// backend/models/Equipment.js
const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    quantityTotal: { type: Number, required: true, min: 0 },
    quantityAvailable: { type: Number, required: true, min: 0 },
    quantityDamaged: { type: Number, default: 0, min: 0 },
    // optional vendor / location fields
    location: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ensure quantities consistent if created via app
equipmentSchema.pre("save", function (next) {
  if (this.quantityAvailable == null) {
    this.quantityAvailable = this.quantityTotal;
  }
  next();
});

module.exports = mongoose.model("Equipment", equipmentSchema);
