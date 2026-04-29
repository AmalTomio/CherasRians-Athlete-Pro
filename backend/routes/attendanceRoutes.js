const express = require("express");
const router = express.Router();

const {
  getCoachSessions,
  getSessionPlayers,
  markAttendance,
  getSessionAttendance,
} = require("../controllers/attendanceController");

const { verifyToken, requireCoach } = require("../middleware/authMiddleware");
const { requireStudent } = require("../middleware/authMiddleware");
const {
  getStudentAttendance,
} = require("../controllers/attendanceController");

const { getCoachAttendanceHistory } = require("../controllers/attendanceController");

router.get(
  "/sessions/coach",
  verifyToken,
  requireCoach,
  getCoachSessions
);

router.get(
  "/session/:bookingId/players",
  verifyToken,
  requireCoach,
  getSessionPlayers
);

router.post(
  "/mark",
  verifyToken,
  requireCoach,
  markAttendance
);

router.get(
  "/session/:bookingId",
  verifyToken,
  requireCoach,
  getSessionAttendance
);

router.get(
  "/coach/history",
  verifyToken,
  requireCoach,
  getCoachAttendanceHistory
);
router.get(
  "/student",
  verifyToken,
  requireStudent,
  getStudentAttendance
);

module.exports = router;
