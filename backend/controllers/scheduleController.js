const Schedule = require("../models/Schedule");
const User = require("../models/User");

exports.getCoachSchedules = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {
      coachId: req.user._id,
      status: "approved",
    };

    // Optional category filtering (U-15 / U-18)
    if (category) {
      filter.playerCategory = category;
    }

    const schedules = await Schedule.find(filter)
      .populate("facilityId", "name")
      .sort({ sessionDate: 1, startTime: 1 });

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Get coach schedules error:", error);
    res.status(500).json({ message: "Failed to fetch schedules" });
  }
};

// backend/controllers/scheduleController.js

exports.getPlayerSchedules = async (req, res) => {
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

    const schedules = await Schedule.find({
      sport: player.sport,
      playerCategory: player.category,
      status: "approved",
    })
      .populate("facilityId", "name")
      .sort({ sessionDate: 1, startTime: 1 })
      .lean();

    res.json({ schedules });
  } catch (err) {
    console.error("getPlayerSchedules error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
