const MatchStats = require("../models/MatchPlayerStats");
const Match = require("../models/Match");

/* ================= PLAYER PERFORMANCE ================= */
exports.getPlayerPerformance = async (req, res) => {
  try {
    const { playerId } = req.params;

    const stats = await MatchStats.find({ playerId });

    let matches = 0;
    let totalRating = 0;
    let totalMinutes = 0;
    let dynamicStats = {};

    stats.forEach((s) => {
      matches++;
      totalRating += s.rating || 0;
      totalMinutes += s.minutesPlayed || 0;

      if (s.stats) {
        for (const [key, value] of Object.entries(s.stats)) {
          dynamicStats[key] = (dynamicStats[key] || 0) + value;
        }
      }
    });

    const avgRating = matches ? totalRating / matches : 0;

    res.json({
      data: {
        metrics: {
          matchesPlayed: matches,
          averageRating: avgRating,
          totalMinutesPlayed: totalMinutes,
          score: avgRating * 10,
          stats: dynamicStats,
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
    const coachId = req.user._id;
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