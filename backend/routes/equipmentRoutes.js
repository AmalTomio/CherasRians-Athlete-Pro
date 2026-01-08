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

// EXCO – All damage history
router.get(
  "/damage-reports",
  verifyToken,
  requireExco,
  equipmentController.getAllDamageReports
);

// EXCO – Damage reports
router.get(
  "/:equipmentId/damage-reports",
  verifyToken,
  requireExco,
  equipmentController.getDamageReportsByEquipment
);

router.post(
  "/damage-reports/:id/resolve",
  verifyToken,
  requireExco,
  equipmentController.resolveDamageReport
);

module.exports = router;
