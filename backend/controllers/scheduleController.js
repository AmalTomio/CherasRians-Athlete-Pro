const Schedule = require("../models/Schedule");
const Attendance = require("../models/Attendance");
const User = require("../models/User");

exports.getCoachSchedules = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {
      coachId: req.user._id,
      status: "approved",
    };

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

    const attendance = await Attendance.find({
      playerId,
    });

    const map = {};
    attendance.forEach((a) => {
      if (a.bookingId) {
        map[a.bookingId.toString()] = a.status;
      }
    });

    const enriched = schedules.map((s) => ({
      ...s,
      attendanceStatus: map[s.bookingId?.toString()] || null,
    }));

    res.json({ schedules: enriched });
  } catch (err) {
    console.error("getPlayerSchedules error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ status: "approved" })
      .populate("coachId", "firstName lastName")
      .lean();

    const bookingIds = schedules
      .map((s) => s.bookingId)
      .filter(Boolean);

    const attendance = await Attendance.find({
      bookingId: { $in: bookingIds },
    });

    const statsMap = {};

    attendance.forEach((a) => {
      const key = a.bookingId?.toString();
      if (!key) return;

      if (!statsMap[key]) {
        statsMap[key] = { present: 0, absent: 0, late: 0 };
      }

      if (a.status === "Present") statsMap[key].present++;
      else if (a.status === "Absent") statsMap[key].absent++;
      else if (a.status === "Late") statsMap[key].late++;
    });

    const enriched = schedules.map((s) => ({
      ...s,
      attendanceStats: statsMap[s.bookingId?.toString()] || null,
    }));

    res.json({ schedules: enriched });
  } catch (err) {
    console.error("Get All Schedules Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};