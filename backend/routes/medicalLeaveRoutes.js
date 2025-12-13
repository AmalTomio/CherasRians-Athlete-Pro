const express = require("express");
const router = express.Router(); // Make sure this is express.Router()

const MedicalLeave = require("../models/MedicalLeave");
const uploadMedical = require("../middleware/uploadMedical");
const {
  submitLeave,
  getStudentLeaves,
  getCoachPendingLeaves,
  reviewLeave,
  getFile,
  getLeaveDetails,
  getCoachLeaves,
} = require("../controllers/medicalLeaveController");

// Import your auth middleware correctly
const authMiddleware = require("../middleware/authMiddleware");
// Or if you have separate exports:
const {
  verifyToken,
  requireStudent,
  requireCoach,
} = require("../middleware/authMiddleware");

// STUDENT ROUTES
router.post(
  "/student",
  verifyToken,
  requireStudent,
  uploadMedical.single("file"),
  submitLeave
);

router.get("/student/:userId", verifyToken, getStudentLeaves);
router.get("/student/stats/me", verifyToken, requireStudent);

// FILE ROUTES
router.get("/file/:leaveId", verifyToken, getFile);
router.get("/details/:leaveId", verifyToken, getLeaveDetails);

// COACH ROUTES
router.get("/coach/pending", verifyToken, requireCoach, getCoachPendingLeaves);
router.patch("/coach/:leaveId", verifyToken, requireCoach, reviewLeave);
router.get("/coach", verifyToken, requireCoach, getCoachLeaves);

// GET MC PDF for specific leave
// router.get("/file/:leaveId", verifyToken, async (req, res) => {
//   try {
//     const leave = await MedicalLeave.findById(req.params.leaveId);

//     if (!leave || !leave.file || !leave.file.buffer)
//       return res.status(404).json({ message: "File not found" });

//     res.set({
//       "Content-Type": leave.file.mimetype,
//       "Content-Disposition": `inline; filename="${leave.file.originalname}"`,
//     });

//     return res.send(leave.file.buffer);
//   } catch (err) {
//     console.error("MC VIEW ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// DELETE leave (student only if pending)
router.delete("/student/:leaveId", verifyToken, async (req, res) => {
  try {
    const leaveId = req.params.leaveId;

    const leave = await MedicalLeave.findById(leaveId);

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Student can delete only their own application
    if (leave.userId.toString() !== req.user.userId.toString())
      return res.status(403).json({ message: "Unauthorized" });

    // Can delete only when pending
    if (leave.status !== "Pending")
      return res.status(400).json({
        message: "Only pending applications can be deleted",
      });

    await leave.deleteOne();

    return res.json({ message: "Leave deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
