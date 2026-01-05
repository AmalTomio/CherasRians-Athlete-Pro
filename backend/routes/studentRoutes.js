const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/me/dashboard", verifyToken, studentController.getMyDashboard);

router.get("/:id", verifyToken, studentController.getStudentDetail);

module.exports = router;
