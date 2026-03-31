// backend/models/TeamLineup.js

const mongoose = require("mongoose");

const teamLineupSchema = new mongoose.Schema(
  {
    coachId: {
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
      required: true,
      index: true,
    },

    starters: [
      {
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        position: String,
      },
    ],

    substitutes: [
      {
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        position: String,
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate lineups per coach/category
teamLineupSchema.index({ coachId: 1, sport: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("TeamLineup", teamLineupSchema);
