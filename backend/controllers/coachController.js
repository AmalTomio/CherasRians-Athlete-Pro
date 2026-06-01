const mongoose = require("mongoose");

const User = require("../models/User");
const Booking = require("../models/Booking");
const Schedule = require("../models/Schedule");
const Attendance = require("../models/Attendance");
const MedicalLeave = require("../models/MedicalLeave");
const Announcement = require("../models/Announcement");
const EquipmentBorrow = require("../models/EquipmentBorrow");
const PlayerPerformance = require("../models/PlayerPerformance");

const moment = require("moment-timezone");

const TZ = "Asia/Kuala_Lumpur";

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

exports.getPlayers = async (req, res) => {
  try {
    const coachSport = req.user.sport;

    let {
      page = 1,
      limit = 10,
      search = "",
      year = "",
      classGroup = "",
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const filter = {
      role: "student",
      sport: coachSport,
    };

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
      User.find(filter).sort({ firstName: 1 }).skip(skip).limit(limit).lean(),

      User.countDocuments(filter),
    ]);

    console.log("PAGE:", page);
    console.log("LIMIT:", limit);
    console.log("SKIP:", skip);
    console.log("RETURNED:", students.length);
    console.log("TOTAL:", total);

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
    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getAllPlayers = async (req, res) => {
  try {
    const coachSport = req.user.sport;

    const students = await User.find({
      role: "student",
      sport: coachSport,
    })
      .sort({ firstName: 1 })
      .lean();

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
      total: formatted.length,
    });
  } catch (err) {
    console.error("getAllPlayers error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      updates,
      { new: true },
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

exports.getCoachDashboard = async (req, res) => {
  try {
    const coachId = new mongoose.Types.ObjectId(req.user._id);
    const now = moment().tz(TZ);

    const todayStart = now.clone().startOf("day").toDate();
    const todayEnd = now.clone().endOf("day").toDate();

    const fromDate7 = now.clone().subtract(6, "days").startOf("day").toDate();

    const coach = await User.findById(coachId).select("sport").lean();
    const coachSport = coach?.sport;

    const [upcomingSessions, totalPlayers, pendingBookings, injuryCount] =
      await Promise.all([
        Schedule.countDocuments({
          coachId,
          sessionDate: { $gte: new Date() },
          status: "approved",
        }),
        User.countDocuments({
          role: "student",
          sport: coachSport,
          status: "active",
        }),
        Booking.countDocuments({
          coachId,
          status: "pending",
        }),
        User.countDocuments({
          role: "student",
          sport: coachSport,
          status: "injured",
        }),
      ]);

    const todaySession = await Schedule.findOne({
      coachId,
      sessionDate: { $gte: todayStart, $lte: todayEnd },
      status: "approved",
    })
      .populate("facilityId", "name")
      .lean();

    const categoryAgg = await Schedule.aggregate([
      {
        $match: {
          coachId,
          status: "approved",
          playerCategory: { $exists: true, $ne: null },
          sessionType: { $in: ["training", "practice", "tryout"] },
        },
      },
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

    const attendanceTrendRaw = await Attendance.aggregate([
      {
        $match: {
          recordedBy: coachId,
          recordedAt: {
            $gte: fromDate7,
            $lte: now.clone().endOf("day").toDate(),
          },
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
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0],
            },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const attendanceTrend = attendanceTrendRaw.map((a) => ({
      date: a._id,
      present: a.present,
      total: a.total,
      rate: a.total === 0 ? 0 : Math.round((a.present / a.total) * 100),
    }));

    const totalPresent = attendanceTrendRaw.reduce(
      (sum, a) => sum + a.present,
      0,
    );

    const totalRecords = attendanceTrendRaw.reduce(
      (sum, a) => sum + a.total,
      0,
    );

    const attendanceRate =
      totalRecords === 0 ? 0 : Math.round((totalPresent / totalRecords) * 100);

    const weeklyAgg = await Schedule.aggregate([
      {
        $match: {
          coachId,
          status: "approved",
          sessionDate: {
            $gte: fromDate7,
            $lte: now.clone().endOf("day").toDate(),
          },
        },
      },
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
    ]);

    const weeklySessions = [];
    for (let i = 0; i < 7; i++) {
      const date = now.clone().subtract(i, "days").format("YYYY-MM-DD");
      const found = weeklyAgg.find((w) => w._id === date);

      weeklySessions.push({
        date,
        count: found ? found.count : 0,
      });
    }

    weeklySessions.reverse();

    const topPlayers = await PlayerPerformance.find({
      sport: coachSport,
    })
      .sort({ rating: -1 })
      .limit(5)
      .populate("playerId", "firstName lastName")
      .lean();

    const avgRatingAgg = await PlayerPerformance.aggregate([
      { $match: { sport: coachSport } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const avgRating = avgRatingAgg[0]?.avgRating
      ? Number(avgRatingAgg[0].avgRating.toFixed(1))
      : 0;

    const nowDate = new Date();

    const recentAnnouncements = await Announcement.find({
      isActive: true,
      $and: [
        {
          $or: [{ expiryDate: null }, { expiryDate: { $gte: nowDate } }],
        },
        {
          $or: [
            { targetUsers: coachId },
            { targetRoles: "coach" },
            { targetSports: coachSport },
          ],
        },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      kpi: {
        upcomingSessions,
        totalPlayers,
        attendanceRate,
        pendingBookings,
        injuryCount,
      },
      categories,
      todaySession,
      attendanceTrend,
      weeklySessions,
      performance: {
        topPlayers,
        avgRating,
      },
      recentAnnouncements,
    });
  } catch (err) {
    console.error("Coach dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q = "" } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      role: { $in: ["student", "coach"] },
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
