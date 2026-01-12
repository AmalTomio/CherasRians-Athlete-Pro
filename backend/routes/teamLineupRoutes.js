const router = require("express").Router();
const { verifyToken, requireCoach } = require("../middleware/authMiddleware");
const controller = require("../controllers/teamLineupController");

router.post("/", verifyToken, requireCoach, controller.saveLineup);
router.get("/", verifyToken, requireCoach, controller.getLineup);

module.exports = router;
