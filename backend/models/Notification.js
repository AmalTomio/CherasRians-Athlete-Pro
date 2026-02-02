const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Targeting
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  targetRoles: [{
    type: String,
    enum: ["student", "coach", "exco"],
  }],

  targetSports: [{
    type: String,
  }],

  targetCategories: [{
    type: String,
    enum: ["U-15", "U-18"],
  }],

  expiresAt: { type: Date },

  isActive: { type: Boolean, default: true },

}, { timestamps: true });

announcementSchema.index({ expiresAt: 1 });
announcementSchema.index({ targetRoles: 1 });
announcementSchema.index({ targetSports: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);
