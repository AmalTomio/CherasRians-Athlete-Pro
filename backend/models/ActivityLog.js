const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    module: {
      type: String,
      required: true, // e.g. Attendance, Booking
    },

    action: {
      type: String,
      required: true, // e.g. MARK_ATTENDANCE
    },

    description: {
      type: String,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
