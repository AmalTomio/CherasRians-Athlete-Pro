// backend/models/Announcement.js
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Direct targeting (highest priority)
    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Filter targeting (fallback)
    targetRoles: [
      {
        type: String,
        enum: ["student", "coach"],
      },
    ],

    targetSports: [{ type: String }],

    targetCategories: [
      {
        type: String,
        enum: ["U-15", "U-18"],
      },
    ],

    expiryDate: { type: Date },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

announcementSchema.index({ expiryDate: 1 });
announcementSchema.index({ targetRoles: 1 });
announcementSchema.index({ targetSports: 1 });

module.exports =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);
