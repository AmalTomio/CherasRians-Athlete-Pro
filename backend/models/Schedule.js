const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Coach sport snapshot (football, badminton, etc.)
    sport: {
      type: String,
      required: true,
      index: true,
    },

    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },

    // ⭐ Category this session is for
    playerCategory: {
      type: String,
      enum: ["U-15", "U-18"],
      required: true,
      index: true,
    },

    // Session details (booking form)
    title: {
      type: String,
      required: true,
      trim: true,
    },

    sessionType: {
      type: String,
      enum: ["training", "practice", "tryout", "event", "meeting"],
      required: true,
    },

    sessionDate: {
      type: Date,
      required: true,
      index: true,
    },

    startTime: {
      type: String, // HH:mm
      required: true,
    },

    endTime: {
      type: String, // HH:mm
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved", // no confirmation
      index: true,
    },
  },
  { timestamps: true }
);

scheduleSchema.index({ sport: 1, playerCategory: 1, sessionDate: 1 });
scheduleSchema.index({ coachId: 1, sessionDate: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);
