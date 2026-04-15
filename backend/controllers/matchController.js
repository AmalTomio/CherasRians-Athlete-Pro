const mongoose = require("mongoose");
const Match = require("../models/Match");
const MatchPlayerStats = require("../models/MatchPlayerStats");
const User = require("../models/User");

exports.createMatch = async (req, res) => {
  try {
    const coachId = req.user._id;
    const { opponent, venue, matchDate, category, lineupId } = req.body;

    const match = await Match.create({
      coachId,
      sport: req.user.sport,
      opponent,
      venue,
      matchDate,
      category,
      lineupId,
    });

    req.app.get("io").emit("dashboard_update");

    res.json({ match });
  } catch (err) {
    console.error("Create Match Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCoachMatches = async (req, res) => {
  try {
    const coachId = req.user._id;

    const matches = await Match.find({ coachId })
      .populate("lineupId")
      .sort({ matchDate: -1 })
      .lean();

    res.json({ matches });
  } catch (err) {
    console.error("Get Coach Matches Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPlayerMatches = async (req, res) => {
  try {
    const playerId = req.user._id;

    const player = await User.findById(playerId)
      .select("sport category")
      .lean();

    if (!player?.sport || !player?.category) {
      return res.status(400).json({
        message: "Player sport or category not assigned",
      });
    }

    const matches = await Match.find({
      sport: player.sport,
      category: player.category,
      status: "scheduled",
    })
      .sort({ matchDate: 1 })
      .lean();

    res.json({ matches });
  } catch (err) {
    console.error("Get Player Matches Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllMatches = async (req, res) => {
  try {
    const { sport, category, result } = req.query;

    let filter = {};
    if (sport) filter.sport = sport;
    if (category) filter.category = category;
    if (result) filter.result = result;

    const matches = await Match.find(filter)
      .populate("coachId", "firstName lastName")
      .sort({ matchDate: -1 })
      .lean();

    res.json({ matches });
  } catch (err) {
    console.error("Get All Matches Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.saveResult = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { ourScore, opponentScore } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.score = { our: ourScore, opponent: opponentScore };

    if (ourScore > opponentScore) match.result = "win";
    else if (ourScore < opponentScore) match.result = "loss";
    else match.result = "draw";

    match.status = "completed";

    await match.save();

    req.app.get("io").emit("dashboard_update");

    res.json({ match });
  } catch (err) {
    console.error("Save Result Error:", err);
    res.status(500).json({ message: "Error saving result" });
  }
};

exports.savePlayerStats = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { stats } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const ops = stats.map((p) => ({
      updateOne: {
        filter: { matchId, playerId: p.playerId },
        update: {
          $set: {
            matchId,
            playerId: p.playerId,
            sport: match.sport,
            category: match.category,
            isStarter: p.isStarter || false,
            minutesPlayed: p.minutesPlayed || 0,
            rating: p.rating || 0,
            stats: p.stats || {},
          },
        },
        upsert: true,
      },
    }));

    await MatchPlayerStats.bulkWrite(ops);

    req.app.get("io").emit("dashboard_update");

    res.json({ message: "Stats saved" });
  } catch (err) {
    console.error("Save Stats Error:", err);
    res.status(500).json({ message: "Error saving stats" });
  }
};