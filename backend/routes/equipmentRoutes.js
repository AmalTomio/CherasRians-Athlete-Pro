// backend/routes/equipmentRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const equipmentController = require("../controllers/equipmentController");
const {
  verifyToken,
  requireCoach,
  requireExco,
} = require("../middleware/authMiddleware");

// ===== Equipment =====
router.get("/", verifyToken, equipmentController.getEquipmentList);

// NEW: available equipment only
router.get(
  "/available",
  verifyToken,
  equipmentController.getAvailableEquipment
);

// EXCO
router.post("/", verifyToken, requireExco, equipmentController.createEquipment);

// ===== Equipment Requests =====
router.post(
  "/requests",
  verifyToken,
  requireCoach,
  equipmentController.requestEquipment
);
router.get(
  "/requests",
  verifyToken,
  requireExco,
  equipmentController.listRequests
);
router.post(
  "/requests/:id/process",
  verifyToken,
  requireExco,
  equipmentController.processRequest
);

// ===== Damage =====
router.post(
  "/report-damage",
  verifyToken,
  requireCoach,
  upload.array("images", 3),
  equipmentController.reportDamage
);
module.exports = router;
