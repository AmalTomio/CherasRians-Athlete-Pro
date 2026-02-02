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

    targetRoles: [{ type: String, enum: ["student", "coach", "exco"] }],
    targetSports: [{ type: String }],
    targetCategories: [{ type: String }],

    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);
