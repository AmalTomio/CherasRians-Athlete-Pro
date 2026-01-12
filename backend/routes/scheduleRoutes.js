const express = require("express");
const router = express.Router();

const {
  getCoachSchedules,
  getPlayerSchedules,
} = require("../controllers/scheduleController");

const {
  verifyToken,
  requireCoach,
  requireStudent,
} = require("../middleware/authMiddleware");

router.get("/coach", verifyToken, requireCoach, getCoachSchedules);

router.get("/player", verifyToken, requireStudent, getPlayerSchedules);

module.exports = router;
