const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { verifyToken } = require("../middleware/authMiddleware");

// Create announcement (Exco & Coach)
router.post("/", verifyToken, announcementController.createAnnouncement);

// Get active announcements
router.get("/", verifyToken, announcementController.getAnnouncements);

module.exports = router;
