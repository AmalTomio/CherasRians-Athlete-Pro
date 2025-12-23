const express = require("express");
const router = express.Router();

const {
  getCoachSessions,
  getSessionPlayers,
  markAttendance,
  getSessionAttendance,
} = require("../controllers/attendanceController");

const { verifyToken, requireCoach } = require("../middleware/authMiddleware");

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

module.exports = router;
