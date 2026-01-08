// backend/routes/excoRoutes.js
const express = require("express");
const router = express.Router();

const excoController = require("../controllers/excoController");
const { verifyToken, requireExco } = require("../middleware/authMiddleware");
const {
  getPendingBookings,
  approveBooking,
  getAllBookings,
} = require("../controllers/bookingController");

router.get("/students", verifyToken, requireExco, excoController.getStudents);
router.put(
  "/students/:id/sport",
  verifyToken,
  requireExco,
  excoController.assignSport
);
router.get("/stats/sports", excoController.getSportStats);
router.get("/bookings", verifyToken, requireExco, getAllBookings);

router.get("/bookings/pending", verifyToken, requireExco, getPendingBookings);
router.put("/bookings/:id/approve", verifyToken, requireExco, approveBooking);
router.get(
  "/coaches-by-sport",
  verifyToken,
  requireExco,
  excoController.getCoachesBySport
);

router.get("/coaches", verifyToken, requireExco, excoController.getAllCoaches);
router.put(
  "/coaches/:id/status",
  verifyToken,
  requireExco,
  excoController.updateCoachStatus
);

module.exports = router;
