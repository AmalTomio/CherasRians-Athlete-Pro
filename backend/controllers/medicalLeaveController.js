const MedicalLeave = require("../models/MedicalLeave");
const User = require("../models/User");
const Notification = require("../models/Notification");

exports.submitLeave = async (req, res) => {
  try {
    const { userId, startDate, endDate, reason } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Medical certificate file is required" });
    }

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    // Get student details
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Convert file buffer to Base64
    const fileBuffer = req.file.buffer;
    const fileBase64 = fileBuffer.toString("base64");

    const leave = await MedicalLeave.create({
      userId,
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.staffId || `S${Date.now().toString().slice(-5)}`,
      team: student.sport ? `${student.sport} Team` : "General Team",
      sport: student.sport || "General",
      startDate: start,
      endDate: end,
      duration,
      reason,
      fileData: fileBase64,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      status: "Pending",
    });

    // Find coach for this student's sport
    const coach = await User.findOne({
      role: "coach",
      sport: student.sport,
    });

    if (coach) {
      // Create notification for coach
      await Notification.create({
        toUser: coach._id,
        title: "New Medical Leave Application",
        message: `${student.firstName} ${student.lastName} submitted a medical leave application`,
        type: "medical_leave",
        referenceId: leave._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Medical leave submitted successfully",
      leave: {
        _id: leave._id,
        startDate: leave.startDate,
        endDate: leave.endDate,
        duration: leave.duration,
        reason: leave.reason,
        status: leave.status,
        submittedAt: leave.submittedAt,
      },
    });
  } catch (err) {
    console.error("Submit Leave Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentLeaves = async (req, res) => {
  try {
    const leaves = await MedicalLeave.find({
      userId: req.params.userId,
    })
      .select("-fileData") // Don't send file data in list view
      .sort({ submittedAt: -1 })
      .populate("coachId", "firstName lastName");

    // Get statistics
    const total = leaves.length;
    const pending = leaves.filter((l) => l.status === "Pending").length;
    const approved = leaves.filter((l) => l.status === "Approved").length;
    const rejected = leaves.filter((l) => l.status === "Rejected").length;

    res.json({
      leaves,
      stats: { total, pending, approved, rejected },
    });
  } catch (err) {
    console.error("Get Student Leaves Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get file by ID
exports.getFile = async (req, res) => {
  try {
    const leave = await MedicalLeave.findById(req.params.leaveId).select(
      "fileData fileName fileType"
    );

    if (!leave) {
      return res.status(404).json({ message: "Medical leave not found" });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(leave.fileData, "base64");

    // Set appropriate headers
    res.set({
      "Content-Type": leave.fileType,
      "Content-Disposition": `inline; filename="${leave.fileName}"`,
      "Content-Length": fileBuffer.length,
    });

    res.send(fileBuffer);
  } catch (err) {
    console.error("Get File Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get leave details with file info (for coach view)
exports.getLeaveDetails = async (req, res) => {
  try {
    const leave = await MedicalLeave.findById(req.params.leaveId)
      .populate("userId", "firstName lastName staffId sport year classGroup")
      .populate("coachId", "firstName lastName");

    if (!leave) {
      return res.status(404).json({ message: "Medical leave not found" });
    }

    res.json({
      _id: leave._id,
      studentName: leave.studentName,
      studentId: leave.studentId,
      team: leave.team,
      sport: leave.sport,
      startDate: leave.startDate,
      endDate: leave.endDate,
      duration: leave.duration,
      reason: leave.reason,
      fileName: leave.fileName,
      fileType: leave.fileType,
      fileSize: leave.fileSize,
      status: leave.status,
      coachRemarks: leave.coachRemarks,
      coachName: leave.coachName,
      verifiedAt: leave.verifiedAt,
      submittedAt: leave.submittedAt,
      student: leave.userId,
      coach: leave.coachId,
    });
  } catch (err) {
    console.error("Get Leave Details Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCoachPendingLeaves = async (req, res) => {
  try {
    const coachId = req.user._id;
    const coach = await User.findById(coachId);

    // Get leaves for students in coach's sport
    const leaves = await MedicalLeave.find({
      sport: coach.sport,
      status: "Pending",
    })
      .select("-fileData") // Don't send file data in list
      .populate("userId", "firstName lastName staffId sport year classGroup")
      .sort({ submittedAt: -1 });

    res.json({ leaves });
  } catch (err) {
    console.error("Get Coach Pending Leaves Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.reviewLeave = async (req, res) => {
  try {
    const { status, coachRemarks } = req.body;
    const coach = await User.findById(req.user.userId);

    if (!coach || coach.role !== "coach") {
      return res.status(403).json({ message: "Access denied" });
    }

    const leave = await MedicalLeave.findById(req.params.leaveId);

    if (!leave) {
      return res.status(404).json({ message: "Medical leave not found" });
    }

    // 🔒 CRITICAL SPORT CHECK
    if (leave.sport !== coach.sport) {
      return res.status(403).json({
        message: "You are not allowed to review this application",
      });
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
      message: `Your medical leave has been ${status.toLowerCase()}`,
      type: "medical_leave_update",
      referenceId: leave._id,
    });
    res.json({
      success: true,
      message: `Medical leave ${status.toLowerCase()} successfully`,
      leave,
    });
  } catch (err) {
    console.error("Review Leave Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCoachLeaves = async (req, res) => {
  try {
    const coach = await User.findById(req.user.userId);

    if (!coach || coach.role !== "coach") {
      return res.status(403).json({ message: "Access denied" });
    }

    const leaves = await MedicalLeave.find({
      sport: coach.sport, // 🔒 HARD FILTER BY SPORT
    })
      .select("-fileData")
      .sort({ submittedAt: -1 });

    res.json({ leaves });
  } catch (err) {
    console.error("Get Coach Leaves Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
