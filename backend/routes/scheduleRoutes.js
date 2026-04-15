const express = require("express");
const router = express.Router();

const {
  getCoachSchedules,
  getPlayerSchedules,
  getAllSchedules,
} = require("../controllers/scheduleController");

const {
  verifyToken,
  requireCoach,
  requireStudent,
  requireExco,
} = require("../middleware/authMiddleware");

router.get("/coach", verifyToken, requireCoach, getCoachSchedules);
router.get("/player", verifyToken, requireStudent, getPlayerSchedules);

router.get("/all", verifyToken, requireExco, getAllSchedules);

module.exports = router;