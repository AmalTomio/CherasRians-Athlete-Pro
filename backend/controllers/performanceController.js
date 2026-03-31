const mongoose = require("mongoose");
const PlayerPerformance = require("../models/PlayerPerformance");
const Match = require("../models/Match");

/* ================= SAVE / UPDATE PERFORMANCE ================= */
exports.updatePerformance = async (req, res) => {
  try {
    const { playerId, sport, category, drills } = req.body;

    if (!playerId || !drills) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔥 calculate rating (0–10 scale)
    const values = Object.values(drills);
    const avg =
      values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;

    const score = Math.round(avg * 10);

    const updated = await PlayerPerformance.findOneAndUpdate(
      { playerId },
      {
        playerId,
        sport,
        category,
        drills,
        rating: avg,
        score,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      message: "Performance updated",
      data: updated,
    });
  } catch (err) {
    console.error("Update Performance Error:", err);
    res.status(500).json({ message: "Error updating performance" });
  }
};

/* ================= PLAYER PERFORMANCE ================= */
exports.getPlayerPerformance = async (req, res) => {
  try {
    const { playerId } = req.params;

    const perf = await PlayerPerformance.findOne({ playerId });

    if (!perf) {
      return res.json({
        data: {
          metrics: {
            averageRating: 0,
            score: 0,
            drills: {},
          },
        },
      });
    }

    res.json({
      data: {
        metrics: {
          averageRating: perf.rating || 0,
          score: perf.score || 0,
          drills: perf.drills || {},
        },
      },
    });
  } catch (err) {
    console.error("Player Performance Error:", err);
    res.status(500).json({ message: "Error fetching player performance" });
  }
};

/* ================= TEAM PERFORMANCE ================= */
exports.getTeamPerformance = async (req, res) => {
  try {
    const coachId = new mongoose.Types.ObjectId(req.user._id);
    const { category } = req.query;

    const matches = await Match.find({
      coachId,
      category,
      status: "completed",
    });

    let wins = 0,
      losses = 0,
      draws = 0;

    matches.forEach((m) => {
      if (m.result === "win") wins++;
      else if (m.result === "loss") losses++;
      else draws++;
    });

    res.json({
      data: {
        totalMatches: matches.length,
        wins,
        losses,
        draws,
      },
    });
  } catch (err) {
    console.error("Team Performance Error:", err);
    res.status(500).json({ message: "Error fetching team performance" });
  }
};