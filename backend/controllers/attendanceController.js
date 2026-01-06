const Booking = require("../models/Booking");
const Attendance = require("../models/Attendance");
const User = require("../models/User");

// Only these reasons allow attendance
const ATTENDANCE_REASONS = ["training", "tryout"];

exports.getCoachSessions = async (req, res) => {
  try {
    const coachId = req.user.userId || req.user._id;

    const sessions = await Booking.find({
      coachId,
      status: "approved",
      reason: { $in: ATTENDANCE_REASONS },
    })
      .populate("facilityId", "name")
      .sort({ startAt: -1 });

    res.json({ sessions });
  } catch (err) {
    console.error("Get Coach Sessions Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSessionPlayers = async (req, res) => {
  try {
    const coachId = req.user.userId || req.user._id;
    const { bookingId } = req.params;

    // 1. Validate booking belongs to coach
    const booking = await Booking.findOne({
      _id: bookingId,
      coachId,
      status: "approved",
      reason: { $in: ATTENDANCE_REASONS },
    });

    if (!booking) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // 2. Get coach sport
    const coach = await User.findById(coachId).select("sport");

    if (!coach || !coach.sport) {
      return res.status(400).json({ message: "Coach sport not assigned" });
    }

    // 3. Get players by sport
    const players = await User.find({
      role: "student",
      sport: coach.sport,
    }).select("firstName lastName classGroup sport");

    return res.json({ players });
  } catch (err) {
    console.error("Get Session Players Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/attendance/mark
 */
exports.markAttendance = async (req, res) => {
  try {
    const coachId = req.user.userId || req.user._id;
    const { bookingId, records } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      coachId,
      status: "approved",
      reason: { $in: ATTENDANCE_REASONS },
    });

    if (!booking) {
      return res.status(403).json({ message: "Unauthorized booking" });
    }

    const ops = records.map((r) => ({
      updateOne: {
        filter: {
          bookingId,
          playerId: r.playerId,
        },
        update: {
          bookingId,
          playerId: r.playerId,
          status: r.status,
          remarks: r.remarks || "",
          recordedBy: coachId,
          recordedAt: new Date(),
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);

    res.json({ message: "Attendance saved successfully" });
  } catch (err) {
    console.error("Mark Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/attendance/session/:bookingId
 */
exports.getSessionAttendance = async (req, res) => {
  try {
    const coachId = req.user.userId || req.user._id;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      coachId,
    });

    if (!booking) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const attendance = await Attendance.find({ bookingId })
      .populate("playerId", "firstName lastName staffId")
      .sort({ "playerId.firstName": 1 });

    res.json({ attendance });
  } catch (err) {
    console.error("Get Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
