const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

// Get notifications (paginated)
router.get("/", verifyToken, notificationController.getNotifications);

module.exports = router;
