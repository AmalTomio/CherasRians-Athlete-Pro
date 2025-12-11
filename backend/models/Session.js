const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jwtToken: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isValid: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);
