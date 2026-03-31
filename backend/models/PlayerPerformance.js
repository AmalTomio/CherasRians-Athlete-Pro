const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  playerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  sport: String,
  category: String,

  attendanceRate: Number,
  matchesPlayed: Number,
  goals: Number,
  assists: Number,

  disciplinePoints: Number,
  rating: Number,

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PlayerPerformance", performanceSchema);