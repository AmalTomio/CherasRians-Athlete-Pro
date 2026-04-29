const router = require("express").Router();
const ctrl = require("../controllers/matchController");

const { verifyToken, requireCoach } = require("../middleware/authMiddleware");


router.post("/", verifyToken, requireCoach, ctrl.createMatch);

router.get("/coach", verifyToken, requireCoach, ctrl.getCoachMatches);
router.get("/player", verifyToken, ctrl.getPlayerMatches);
router.get("/all", verifyToken, ctrl.getAllMatches);


router.patch("/:matchId", ctrl.saveResult);
router.post("/stats/:matchId", verifyToken, requireCoach, ctrl.savePlayerStats);


router.patch("/:matchId/cancel", verifyToken, requireCoach, ctrl.cancelMatch);

module.exports = router;