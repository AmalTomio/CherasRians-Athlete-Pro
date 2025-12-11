// backend/routes/coachRoutes.js
const express = require("express");
const router = express.Router();
const coachController = require("../controllers/coachController");
const { verifyToken, requireCoach } = require("../middleware/authMiddleware");

// GET players
router.get("/players", verifyToken, requireCoach, coachController.getPlayers);

// UPDATE player
router.put("/players/:id", verifyToken, requireCoach, coachController.updatePlayer);

module.exports = router;
