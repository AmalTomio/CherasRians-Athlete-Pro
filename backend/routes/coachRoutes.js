const express = require("express");
const router = express.Router();
const coachController = require("../controllers/coachController");
const { verifyToken, requireCoach } = require("../middleware/authMiddleware");

router.get("/players", verifyToken, requireCoach, coachController.getPlayers);

router.get(
  "/players/all",
  verifyToken,
  requireCoach,
  coachController.getAllPlayers,
);

router.get(
  "/dashboard",
  verifyToken,
  requireCoach,
  coachController.getCoachDashboard,
);

router.put(
  "/players/:id",
  verifyToken,
  requireCoach,
  coachController.updatePlayer,
);

router.get(
  "/users/search",
  verifyToken,
  requireCoach,
  coachController.searchUsers,
);

module.exports = router;
