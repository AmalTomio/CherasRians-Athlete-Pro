const router = require("express").Router();
const ctrl = require("../controllers/performanceController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/player/:playerId", verifyToken, ctrl.getPlayerPerformance);
router.get("/team", verifyToken, ctrl.getTeamPerformance);

module.exports = router;