const express = require("express");
const router = express.Router();
const controller = require("../controllers/equipmentBorrowController");
const upload = require("../middleware/upload");

const setReturnUpload = (req, res, next) => {
  req.uploadType = "return";
  next();
};

const {
  verifyToken,
  requireCoach,
  requireExco,
} = require("../middleware/authMiddleware");

// Coach submits return
router.post(
  "/return/:borrowId",
  verifyToken,
  requireCoach,
  setReturnUpload,
  upload.single("proof"),
  controller.submitReturn,
);
// Exco releases equipment
router.post(
  "/release/:bookingId",
  verifyToken,
  requireExco,
  controller.releaseEquipment,
);

// Exco verifies return
router.post(
  "/verify/:borrowId",
  verifyToken,
  requireExco,
  controller.verifyReturn,
);

// Exco dashboard
router.get("/pending", verifyToken, requireExco, controller.getPendingReturns);

// Coach dashboard
router.get(
  "/my-returns",
  verifyToken,
  requireCoach,
  controller.getCoachReturns,
);

module.exports = router;
