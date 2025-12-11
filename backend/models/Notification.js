// backend/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed }, // optional extra data (e.g. bookingId)
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
