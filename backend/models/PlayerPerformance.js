const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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

  drills: {
    type: Object,
    default: {},
  },

  rating: {
    type: Number, 
    default: 0,
  },

  score: {
    type: Number, 
    default: 0,
  },

  history: [
  {
    date: { type: Date, default: Date.now },
    rating: Number,
    score: Number,
  },
],

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

performanceSchema.index({ playerId: 1 }, { unique: true });

module.exports = mongoose.model("PlayerPerformance", performanceSchema);