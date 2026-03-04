const User = require("../models/User");
const Booking = require("../models/Booking");
const { decrypt } = require("../utils/crypto");

exports.getStudents = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      year,
      classGroup,
      sport,
    } = req.query;
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const filter = { role: "student" };

    if (search && search.trim() !== "") {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }
    if (year) filter.year = Number(year);
    if (classGroup) filter.classGroup = classGroup;
    if (sport) filter.sport = sport;

    const [students, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    // decrypt NRIC for response
    const studentsOut = students.map((s) => {
      const nric = s.nricEncrypted ? decrypt(s.nricEncrypted) : null;
      return {
        userId: s._id,
        firstName: s.firstName,
        lastName: s.lastName,
        year: s.year,
        classGroup: s.classGroup,
        sport: s.sport,
        nric,
      };
    });

    return res.json({
      students: studentsOut,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("EXCO GET STUDENTS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.assignSport = async (req, res) => {
  try {
    const { id } = req.params;
    const { sport } = req.body;
    if (!sport) return res.status(400).json({ message: "Sport is required." });

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      { sport },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Student not found." });

    return res.json({ message: "Sport assigned", studentId: updated._id });
  } catch (err) {
    console.error("ASSIGN SPORT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.updateStudentAcademic = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, classGroup } = req.body;

    if (!year || !classGroup) {
      return res.status(400).json({ message: "Year and class are required." });
    }

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      { year: Number(year), classGroup },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.json({ message: "Academic info updated." });
  } catch (err) {
    console.error("UPDATE STUDENT ACADEMIC ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.findOneAndDelete({
      _id: id,
      role: "student",
    });

    if (!deleted) {z
      return res.status(404).json({ message: "Student not found." });
    }

    return res.json({ message: "Student deleted successfully." });
  } catch (err) {
    console.error("DELETE STUDENT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getSportStats = async (req, res) => {
  try {
    const sports = [
      "football",
      "volleyball",
      "sepak_takraw",
      "badminton",
      "netball",
    ];

    // Count students by sport
    const results = await Promise.all(
      sports.map(async (s) => ({
        sport: s,
        count: await User.countDocuments({ role: "student", sport: s }),
      }))
    );

    return res.json({ stats: results });
  } catch (err) {
    console.error("getSportStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// New endpoint: booking stats by status
exports.getBookingStats = async (req, res) => {
  try {
    const statuses = ["pending", "approved", "rejected", "cancelled"];
    const results = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await Booking.countDocuments({ status })
      }))
    );
    return res.json({ stats: results });
  } catch (err) {
    console.error("getBookingStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// New endpoint: simple trend stats (bookings per month for last 6 months)
exports.getTrendStats = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const pipeline = [
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ];
    const agg = await Booking.aggregate(pipeline);
    const stats = agg.map((item) => ({
      period: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      count: item.count
    }));
    return res.json({ stats });
  } catch (err) {
    console.error("getTrendStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getCoachesBySport = async (req, res) => {
  try {
    const coaches = await User.find(
      { role: "coach", sport: { $ne: null } },
      { firstName: 1, lastName: 1, sport: 1 }
    ).lean();

    const grouped = {};

    coaches.forEach((c) => {
      if (!grouped[c.sport]) grouped[c.sport] = [];
      grouped[c.sport].push({
        coachId: c._id,
        name: `${c.firstName} ${c.lastName}`,
      });
    });

    return res.json(grouped);
  } catch (err) {
    console.error("GET COACHES BY SPORT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================================
// GET ALL COACHES (EXCO) - PAGINATED
// ================================
exports.getAllCoaches = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    let {
      page = 1,
      limit = 10,
      search = "",
      sport,
      isActive,
    } = req.query;

    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const filter = { role: "coach" };

    // Search by name
    if (search && search.trim() !== "") {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by sport
    if (sport) {
      filter.sport = sport;
    }

    // Filter by active status
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const [coaches, total] = await Promise.all([
      User.find(filter, {
        firstName: 1,
        lastName: 1,
        email: 1,
        sport: 1,
        isActive: 1,
        createdAt: 1,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return res.json({
      coaches,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET COACHES ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ================================
// UPDATE COACH STATUS (ACTIVE / RETIRED)
// ================================

exports.updateCoachStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const coach = await User.findOneAndUpdate(
      { _id: id, role: "coach" },
      { isActive },
      { new: true }
    ).select("_id firstName lastName sport email isActive createdAt");

    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    return res.json({
      message: "Coach status updated",
      coach,
    });
  } catch (err) {
    console.error("UPDATE COACH STATUS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
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
      role: { $in: ["student", "coach"] }, // no exco
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
    console.error("EXCO SEARCH USERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
