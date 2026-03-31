const mongoose = require("mongoose");

const matchPlayerStatsSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },

    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sport: {
      type: String,
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: ["U-15", "U-18"],
      required: true,
      index: true,
    },

    isStarter: {
      type: Boolean,
      default: false,
    },

    minutesPlayed: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },

    stats: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

matchPlayerStatsSchema.index({ matchId: 1, playerId: 1 }, { unique: true });

module.exports = mongoose.model(
  "MatchPlayerStats",
  matchPlayerStatsSchema
);