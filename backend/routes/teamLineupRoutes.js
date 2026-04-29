const router = require("express").Router();
const {
  verifyToken,
  requireCoach,
} = require("../middleware/authMiddleware");

const controller = require("../controllers/teamLineupController");

router.post("/", verifyToken, requireCoach, controller.saveLineup);
router.get("/", verifyToken, requireCoach, controller.getLineup);

router.get("/all", verifyToken, requireCoach, controller.getAllLineups);

module.exports = router;