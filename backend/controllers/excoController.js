// backend/controllers/excoController.js
const User = require("../models/User");
const { decrypt } = require("../utils/crypto");

exports.getStudents = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", year, classGroup, sport } = req.query;
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
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
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

    if (!updated) return res.status(404).json({ message: "Student not found." });

    return res.json({ message: "Sport assigned", studentId: updated._id });
  } catch (err) {
    console.error("ASSIGN SPORT ERROR:", err);
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
        count: await User.countDocuments({ role: "student", sport: s })
      }))
    );

    return res.json({ stats: results });
  } catch (err) {
    console.error("getSportStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

