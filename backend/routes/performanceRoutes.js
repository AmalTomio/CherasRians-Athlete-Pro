const router = require("express").Router();
const ctrl = require("../controllers/performanceController");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireStudent } = require("../middleware/authMiddleware");

router.get("/player/:playerId", verifyToken, ctrl.getPlayerPerformance);
router.get("/team", verifyToken, ctrl.getTeamPerformance);

router.post("/update", verifyToken, ctrl.updatePerformance);
router.get(
  "/student",
  verifyToken,
  requireStudent,
  ctrl.getStudentMatchPerformance
);

module.exports = router;