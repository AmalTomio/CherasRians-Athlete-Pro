const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sport: { type: String, required: true },

    category: {
      type: String,
      enum: ["U-15", "U-18"],
      required: true,
    },

    opponent: { type: String, required: true },
    venue: String,

    matchDate: { type: Date, required: true },

    lineupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamLineup",
    },

    status: {
      type: String,
      enum: ["scheduled", "completed"],
      default: "scheduled",
    },

    score: {
      our: Number,
      opponent: Number,
    },

    result: {
      type: String,
      enum: ["win", "loss", "draw"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);