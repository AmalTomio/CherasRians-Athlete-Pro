// backend/routes/equipmentRoutes.js
const express = require("express");
const router = express.Router();

const equipmentController = require("../controllers/equipmentController");
const { verifyToken, requireCoach, requireExco } = require("../middleware/authMiddleware");

// Public / authenticated read
router.get("/", verifyToken, equipmentController.getEquipmentList);

// Create equipment (Exco only)
router.post("/", verifyToken, requireExco, equipmentController.createEquipment);

// Coach: request equipment
router.post("/request", verifyToken, requireCoach, equipmentController.requestEquipment);

// Coach: report damage
router.post("/report-damage", verifyToken, requireCoach, equipmentController.reportDamage);

// Exco: list all requests
router.get("/requests", verifyToken, requireExco, equipmentController.listRequests);

// Exco: process request
router.post("/requests/:id/process", verifyToken, requireExco, equipmentController.processRequest);

module.exports = router;
