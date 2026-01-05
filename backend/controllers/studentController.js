const User = require("../models/User");

exports.getStudentDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get student
    const student = await User.findOne(
      { _id: id, role: "student" },
      {
        firstName: 1,
        lastName: 1,
        year: 1,
        classGroup: 1,
        sport: 1,
        category: 1,
        status: 1,
      }
    ).lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. Get coach based on sport (DERIVED)
    let coach = null;

    if (student.sport) {
      coach = await User.findOne(
        { role: "coach", sport: student.sport },
        { firstName: 1, lastName: 1, email: 1 }
      ).lean();
    }

    return res.json({
      student,
      coach: coach
        ? {
            name: `${coach.firstName} ${coach.lastName}`,
            email: coach.email,
          }
        : null,
    });
  } catch (err) {
    console.error("GET STUDENT DETAIL ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getMyDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const student = await User.findOne(
      { _id: userId, role: "student" },
      {
        firstName: 1,
        lastName: 1,
        sport: 1,
        category: 1,
        year: 1,
        classGroup: 1,
        isActive: 1,
      }
    ).lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let coach = null;
    if (student.sport) {
      coach = await User.findOne(
        { role: "coach", sport: student.sport },
        { firstName: 1, lastName: 1 }
      ).lean();
    }

    return res.json({
      student,
      coach: coach ? { name: `${coach.firstName} ${coach.lastName}` } : null,
    });
  } catch (err) {
    console.error("GET STUDENT DASHBOARD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
