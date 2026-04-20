const express = require("express");
const router = express.Router();

const uploadMedical = require("../middleware/uploadMedical");

const {
  submitLeave,
  getStudentLeaves,
  getStudentStats,
  getCoachPendingLeaves,
  reviewLeave,
  getFile,
  getLeaveDetails,
  getCoachLeaves,
  deleteStudentLeave,
} = require("../controllers/medicalLeaveController");

const {
  verifyToken,
  requireStudent,
  requireCoach,
} = require("../middleware/authMiddleware");

/* ================= STUDENT ================= */
router.post(
  "/student",
  verifyToken,
  requireStudent,
  uploadMedical.single("file"),
  submitLeave
);

router.get("/student/:userId", verifyToken, getStudentLeaves);

router.get(
  "/student/stats/me",
  verifyToken,
  requireStudent,
  getStudentStats // ✅ FIXED (no more undefined)
);

router.delete(
  "/student/:leaveId",
  verifyToken,
  requireStudent,
  deleteStudentLeave // ✅ clean handler
);

/* ================= FILE ================= */
router.get("/file/:leaveId", verifyToken, getFile);
router.get("/details/:leaveId", verifyToken, getLeaveDetails);

/* ================= COACH ================= */
router.get(
  "/coach/pending",
  verifyToken,
  requireCoach,
  getCoachPendingLeaves
);

router.get(
  "/coach",
  verifyToken,
  requireCoach,
  getCoachLeaves
);

router.patch(
  "/coach/:leaveId",
  verifyToken,
  requireCoach,
  reviewLeave
);

module.exports = router;