const mongoose = require("mongoose");
const PlayerPerformance = require("../models/PlayerPerformance");
const Match = require("../models/Match");
const MatchPlayerStats = require("../models/MatchPlayerStats");

exports.updatePerformance = async (req, res) => {
  try {
    const { playerId, sport, category, drills } = req.body;

    if (!playerId || !drills) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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
    $push: {
      history: {
        rating: avg,
        score,
        date: new Date(),
      },
    },
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
            history: [],
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


exports.getStudentMatchPerformance = async (req, res) => {
  try {
    const playerId = req.user._id;

    const stats = await MatchPlayerStats.find({ playerId })
      .populate({
        path: "matchId",
        select: "matchDate opponent result",
      })
      .sort({ "matchId.matchDate": 1 })
      .lean();

    res.json({ stats });
  } catch (err) {
    console.error("Student Match Performance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};