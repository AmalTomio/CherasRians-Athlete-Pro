const User = require("../models/User");
const Booking = require("../models/Booking");
const Schedule = require("../models/Schedule");
const Attendance = require("../models/Attendance");
const moment = require("moment-timezone");

const TZ = "Asia/Kuala_Lumpur";

/* ================= UTIL ================= */

const formatStatus = (status) => {
  switch (status) {
    case "active":
      return "Active";
    case "injured":
      return "Injured";
    case "not_active":
      return "Not Active";
    default:
      return "Active";
  }
};

/* ================= GET PLAYERS ================= */

exports.getPlayers = async (req, res) => {
  try {
    const coachSport = req.user.sport;

    let { page = 1, limit = 10, search = "", year = "", classGroup = "" } =
      req.query;

    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const filter = { role: "student", sport: coachSport };

    if (search.trim() !== "") {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    if (year !== "" && !isNaN(Number(year))) {
      filter.year = Number(year);
    }

    if (classGroup.trim() !== "") {
      filter.classGroup = classGroup;
    }

    const [students, total] = await Promise.all([
      User.find(filter)
        .sort({ firstName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const formatted = students.map((s) => ({
      _id: s._id,
      firstName: s.firstName,
      lastName: s.lastName,
      year: s.year,
      classGroup: s.classGroup,
      sport: s.sport,

      category: s.category || "",
      position: s.position || "",
      badmintonCategory: s.badmintonCategory || "",

      status: formatStatus(s.status),
    }));

    return res.json({
      students: formatted,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error("getPlayers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE PLAYER ================= */

exports.updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Player not found." });
    }

    return res.json({
      message: "Player updated successfully",
      player: updated,
    });
  } catch (err) {
    console.error("UPDATE PLAYER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= COACH DASHBOARD ================= */

exports.getCoachDashboard = async (req, res) => {
  try {
    const coachId = req.user._id;

    /* ===== KPI ===== */

    const upcomingSessions = await Schedule.countDocuments({
      coachId,
      sessionDate: { $gte: new Date() },
      status: "approved",
    });

    const pendingBookings = await Booking.countDocuments({
      coachId,
      status: "pending",
    });

    const coach = await User.findById(coachId).select("sport");
    const totalPlayers = await User.countDocuments({
      role: "student",
      sport: coach.sport,
    });

    /* ===== ATTENDANCE RATE (30 DAYS) ===== */

    const fromDate = moment().subtract(30, "days").toDate();

    const attendanceAgg = await Attendance.aggregate([
      {
        $match: {
          recordedBy: coachId,
          recordedAt: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalAttendance = attendanceAgg.reduce(
      (sum, a) => sum + a.count,
      0
    );

    const presentCount =
      attendanceAgg.find((a) => a._id === "present")?.count || 0;

    const attendanceRate =
      totalAttendance === 0
        ? 0
        : Math.round((presentCount / totalAttendance) * 100);

    /* ===== CATEGORY DISTRIBUTION ===== */

    const categoryAgg = await Schedule.aggregate([
      { $match: { coachId, status: "approved" } },
      {
        $group: {
          _id: "$playerCategory",
          count: { $sum: 1 },
        },
      },
    ]);

    const categories = {
      U15: categoryAgg.find((c) => c._id === "U-15")?.count || 0,
      U18: categoryAgg.find((c) => c._id === "U-18")?.count || 0,
    };

    /* ===== WEEKLY SESSIONS ===== */

    const weeklySessions = await Schedule.aggregate([
      { $match: { coachId, status: "approved" } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$sessionDate",
              timezone: TZ,
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 7 },
    ]);

    /* ===== ATTENDANCE TREND ===== */

    const attendanceTrend = await Attendance.aggregate([
      {
        $match: {
          recordedBy: coachId,
          recordedAt: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$recordedAt",
              timezone: TZ,
            },
          },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          date: "$_id",
          rate: {
            $round: [
              {
                $multiply: [{ $divide: ["$present", "$total"] }, 100],
              },
              0,
            ],
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    /* ===== RESPONSE ===== */

    res.json({
      kpi: {
        upcomingSessions,
        totalPlayers,
        attendanceRate,
        pendingBookings,
      },
      categories,
      weeklySessions: weeklySessions.map((w) => ({
        date: w._id,
        count: w.count,
      })),
      attendanceTrend,
    });
  } catch (err) {
    console.error("Coach dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ================================
// SEARCH USERS (FOR ANNOUNCEMENT)
// ================================
exports.searchUsers = async (req, res) => {
  try {
    const { q = "" } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      role: { $in: ["student", "coach"] }, // coach cannot search exco
      $or: [
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
      ],
    })
      .select("_id firstName lastName role sport category")
      .limit(10)
      .lean();

    res.json({ users });
  } catch (err) {
    console.error("COACH SEARCH USERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
