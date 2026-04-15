const mongoose = require("mongoose");
const TeamLineup = require("../models/TeamLineup");

exports.saveLineup = async (req, res) => {
  try {
    const coachId = new mongoose.Types.ObjectId(
      req.user.userId || req.user._id
    );

    const { sport, category, starters, substitutes } = req.body;

    if (!sport || !category) {
      return res.status(400).json({ message: "Sport and category required" });
    }

    const payload = {
      coachId,
      sport,
      category,
      starters,
      substitutes,
    };

    const lineup = await TeamLineup.findOneAndUpdate(
      { coachId, sport, category },
      payload,
      { upsert: true, new: true }
    );

    res.json({ message: "Lineup saved", lineup });
  } catch (err) {
    console.error("Save Lineup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLineup = async (req, res) => {
  try {
    const coachId = new mongoose.Types.ObjectId(
      req.user.userId || req.user._id
    );

    const { sport, category } = req.query;

    const lineup = await TeamLineup.findOne({
      coachId,
      sport,
      category,
    }).populate("starters.playerId substitutes.playerId");

    res.json({ lineup });
  } catch (err) {
    console.error("Get Lineup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllLineups = async (req, res) => {
  try {
    const coachId = new mongoose.Types.ObjectId(
      req.user.userId || req.user._id
    );

    const { sport } = req.query;

    let filter = { coachId };
    if (sport) filter.sport = sport;

    const lineups = await TeamLineup.find(filter)
      .sort({ category: 1 })
      .lean();

    res.json({ lineups });
  } catch (err) {
    console.error("Get All Lineups Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};