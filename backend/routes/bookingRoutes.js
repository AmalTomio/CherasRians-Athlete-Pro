const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const {
  verifyToken,
  requireCoach,
  requireExco,
} = require("../middleware/authMiddleware");

// Coach
router.post(
  "/check-availability",
  verifyToken,
  requireCoach,
  bookingController.checkAvailability
);

router.post("/", verifyToken, requireCoach, bookingController.createBooking);

router.get(
  "/coach",
  verifyToken,
  requireCoach,
  bookingController.getCoachBookings
);

// Exco
router.get(
  "/pending",
  verifyToken,
  requireExco,
  bookingController.getPendingBookings
);

router.put(
  "/:id/approve",
  verifyToken,
  requireExco,
  bookingController.approveBooking
);

module.exports = router;
