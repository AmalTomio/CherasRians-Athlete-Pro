const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

// NEW: Get logged-in user info
router.get("/me", verifyToken, authController.getMe);

module.exports = router;
