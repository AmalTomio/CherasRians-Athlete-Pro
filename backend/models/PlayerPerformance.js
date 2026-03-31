// models/PlayerPerformance.js
const performanceSchema = new mongoose.Schema({
  playerId: { type: ObjectId, ref: "User", required: true },
  sport: String,
  category: String,

  attendanceRate: Number,
  matchesPlayed: Number,
  goals: Number,
  assists: Number,

  disciplinePoints: Number,

  rating: Number,

  updatedAt: Date,
});