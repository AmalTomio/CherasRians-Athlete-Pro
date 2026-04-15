const router = require("express").Router();
const ctrl = require("../controllers/matchController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, ctrl.createMatch);

router.get("/coach", verifyToken, ctrl.getCoachMatches);
router.get("/player", verifyToken, ctrl.getPlayerMatches);
router.get("/all", verifyToken, ctrl.getAllMatches);

router.post("/result/:matchId", verifyToken, ctrl.saveResult);
router.post("/stats/:matchId", verifyToken, ctrl.savePlayerStats);

module.exports = router;