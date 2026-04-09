const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const DisciplinaryCase = require("../models/DisciplinaryRecord");

const ATTENDANCE_SESSION_TYPES = ["training", "tryout"];

/* ================= GET COACH SESSIONS ================= */
exports.getCoachSessions = async (req, res) => {
  try {
    const coachId = new mongoose.Types.ObjectId(
      req.user.userId || req.user._id
    );

    const sessions = await Booking.find({
      coachId,
      status: "approved",
      sessionType: { $in: ATTENDANCE_SESSION_TYPES },
    })
      .populate("facilityId", "name")
      .sort({ startAt: -1 });

    res.json({ sessions });
  } catch (err) {
    console.error("Get Coach Sessions Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET SESSION PLAYERS ================= */
exports.getSessionPlayers = async (req, res) => {
  try {
    const coachId = new mongoose.Types.ObjectId(
      req.user.userId || req.user._id
    );

    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      coachId,
      status: "approved",
      sessionType: { $in: ATTENDANCE_SESSION_TYPES },
    });

    if (!booking) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const coach = await User.findById(coachId).select("sport");

    if (!coach?.sport) {
      return res.status(400).json({ message: "Coach sport not assigned" });
    }

    const players = await User.find({
      role: "student",
      sport: coach.sport,
      category: booking.playerCategory,
    }).select("firstName lastName classGroup category");

    res.json({ players });
  } catch (err) {
    console.error("Get Session Players Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= MARK ATTENDANCE ================= */
exports.markAttendance = async (req, res) => {
  try {
    const coachId = new mongoose.Types.ObjectId(
      req.user.userId || req.user._id
    );

    const { bookingId, records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No attendance records provided" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      coachId,
      status: "approved",
      sessionType: { $in: ATTENDANCE_SESSION_TYPES },
    });

    if (!booking) {
      return res.status(403).json({ message: "Unauthorized booking" });
    }

    const coach = await User.findById(coachId).select("sport");

    /* ================= SAVE ATTENDANCE ================= */
    const ops = records.map((r) => ({
      updateOne: {
        filter: {
          bookingId,
          playerId: r.playerId,
        },
        update: {
          $set: {
            bookingId,
            playerId: r.playerId,
            status: r.status,
            remarks: r.remarks || "",
            recordedBy: coachId,
            recordedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);

    /* ================= AUTO DISCIPLINARY ================= */
    for (const r of records) {
      if (["Absent", "Late", "Injured"].includes(r.status)) {
        const attendance = await Attendance.findOne({
          bookingId,
          playerId: r.playerId,
        });

        // 🔥 Prevent duplicate AUTO case
        const exists = await DisciplinaryCase.findOne({
          playerId: r.playerId,
          attendanceId: attendance?._id,
          type: "AUTO",
        });

        if (!exists) {
          await DisciplinaryCase.create({
            playerId: r.playerId,
            coachId,
            sport: coach?.sport,
            category: booking.playerCategory,
            type: "AUTO",
            reason: r.status,
            description: `Auto-generated due to ${r.status}`,
            severity: r.status === "Absent" ? "high" : "medium",
            attendanceId: attendance?._id,
          });
        }
      }
    }

    res.json({ message: "Attendance saved successfully" });
  } catch (err) {
    console.error("Mark Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET SESSION ATTENDANCE ================= */
exports.getSessionAttendance = async (req, res) => {
  try {
    const coachId = new mongoose.Types.ObjectId(
      req.user.userId || req.user._id
    );

    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      coachId,
    });

    if (!booking) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const attendance = await Attendance.find({ bookingId })
      .populate("playerId", "firstName lastName classGroup")
      .sort({ "playerId.firstName": 1 });

    res.json({ attendance });
  } catch (err) {
    console.error("Get Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};