const MedicalLeave = require("../models/MedicalLeave");
const User = require("../models/User");
const Notification = require("../models/Notification");

/* ================= SUBMIT ================= */
exports.submitLeave = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, reason } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "MC file required" });
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Only PDF, JPG, PNG allowed",
      });
    }

    const student = await User.findById(userId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const start = new Date(startDate);
    const end = new Date(endDate);

    const duration =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await MedicalLeave.create({
      userId,
      studentName: `${student.firstName} ${student.lastName}`,

      studentId:
    student.staffId ||
    student.nric ||
    `S${Date.now().toString().slice(-5)}`,

  sport: student.sport,
  category: student.category,

      startDate: start,
      endDate: end,
      duration,
      reason,

      fileData: req.file.buffer,
      fileType: req.file.mimetype,
      fileName: req.file.originalname,
      fileSize: req.file.size,

      status: "Pending",
    });

    const coach = await User.findOne({
      role: "coach",
      sport: student.sport,
    });

    if (coach) {
      await Notification.create({
        toUser: coach._id,
        title: "New Medical Leave",
        message: `${student.firstName} ${student.lastName} submitted leave`,
        type: "medical_leave",
        referenceId: leave._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Medical leave submitted",
      leave,
    });
  } catch (err) {
    console.error("Submit Leave Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= STUDENT LIST ================= */
exports.getStudentLeaves = async (req, res) => {
  try {
    const leaves = await MedicalLeave.find({
      userId: req.params.userId,
    })
      .select("-fileData")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= STUDENT STATS ================= */
exports.getStudentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const leaves = await MedicalLeave.find({ userId });

    const stats = {
      total: leaves.length,
      pending: leaves.filter((l) => l.status === "Pending").length,
      approved: leaves.filter((l) => l.status === "Approved").length,
      rejected: leaves.filter((l) => l.status === "Rejected").length,
    };

    res.json({ stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= FILE VIEW ================= */
exports.getFile = async (req, res) => {
  try {
    const leave = await MedicalLeave.findById(req.params.leaveId);

    if (!leave || !leave.fileData) {
      return res.status(404).json({ message: "File not found" });
    }

    res.set("Content-Type", leave.fileType);
    res.set(
      "Content-Disposition",
      `inline; filename="${leave.fileName}"`
    );

    res.send(leave.fileData);
  } catch (err) {
    console.error("Get File Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DETAILS ================= */
exports.getLeaveDetails = async (req, res) => {
  try {
    const leave = await MedicalLeave.findById(req.params.leaveId)
      .populate("userId", "firstName lastName year classGroup")
      .populate("coachId", "firstName lastName");

    if (!leave) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= COACH PENDING ================= */
exports.getCoachPendingLeaves = async (req, res) => {
  try {
    const coach = await User.findById(req.user._id);

    const leaves = await MedicalLeave.find({
      sport: coach.sport,
      status: "Pending",
    })
      .select("-fileData")
      .populate("userId", "firstName lastName year classGroup")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= REVIEW ================= */
exports.reviewLeave = async (req, res) => {
  try {
    const { status, coachRemarks } = req.body;
    const coach = await User.findById(req.user._id);

    const leave = await MedicalLeave.findById(req.params.leaveId);

    if (!leave) return res.status(404).json({ message: "Not found" });

    if (leave.sport !== coach.sport) {
      return res.status(403).json({ message: "Not allowed" });
    }

    leave.status = status;
    leave.coachRemarks = coachRemarks;
    leave.coachId = coach._id;
    leave.coachName = `${coach.firstName} ${coach.lastName}`;
    leave.verifiedAt = new Date();

    await leave.save();

    await Notification.create({
      toUser: leave.userId,
      title: `Medical Leave ${status}`,
      message: `Your leave is ${status}`,
      type: "medical_leave_update",
    });

    res.json({ success: true, leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= COACH ALL ================= */
exports.getCoachLeaves = async (req, res) => {
  try {
    const coach = await User.findById(req.user._id);

    const leaves = await MedicalLeave.find({
      sport: coach.sport,
    })
      .select("-fileData")
      .populate("userId", "firstName lastName year classGroup")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE ================= */
exports.deleteStudentLeave = async (req, res) => {
  try {
    const leave = await MedicalLeave.findById(req.params.leaveId);

    if (!leave) return res.status(404).json({ message: "Not found" });

    if (leave.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending leave can be deleted",
      });
    }

    await leave.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};