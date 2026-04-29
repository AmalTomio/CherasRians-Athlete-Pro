const DisciplinaryCase = require("../models/DisciplinaryRecord");
const mongoose = require("mongoose");

exports.createCase = async (req, res) => {
  try {
    const coachId = new mongoose.Types.ObjectId(req.user._id);
    const { playerId, sport, category, reason, description, severity } = req.body;

    const newCase = await DisciplinaryCase.create({
      playerId,
      coachId,
      sport,
      category,
      type: "MANUAL",
      reason,
      description,
      severity,
    });

    res.json({ message: "Case created", data: newCase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating case" });
  }
};

exports.updateCase = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await DisciplinaryCase.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.json({ message: "Case updated", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating case" });
  }
};

exports.getCoachCases = async (req, res) => {
  try {
    const coachId = new mongoose.Types.ObjectId(req.user._id);

    const cases = await DisciplinaryCase.find({ coachId })
      .populate("playerId", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json({ data: cases });
  } catch (err) {
    res.status(500).json({ message: "Error fetching cases" });
  }
};

exports.getPlayerCases = async (req, res) => {
  try {
    const playerId = req.user._id;

    const cases = await DisciplinaryCase.find({ playerId })
      .sort({ createdAt: -1 });

    res.json({ data: cases });
  } catch (err) {
    res.status(500).json({ message: "Error fetching cases" });
  }
};

exports.getAllCases = async (req, res) => {
  try {
    const { playerName, sport, category } = req.query;

    let filter = {};

    if (sport) filter.sport = sport;
    if (category) filter.category = category;

    const cases = await DisciplinaryCase.find(filter)
      .populate("playerId", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json({ data: cases });
  } catch (err) {
    res.status(500).json({ message: "Error fetching all cases" });
  }
};