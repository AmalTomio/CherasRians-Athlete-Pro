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
router.get("/stats/bookings", verifyToken, requireExco, excoController.getBookingStats);
router.get("/stats/trends", verifyToken, requireExco, excoController.getTrendStats);
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
// Update student academic info
router.put(
  "/students/:id/academic",
  verifyToken,
  requireExco,
  excoController.updateStudentAcademic
);

// Delete student
router.delete(
  "/students/:id",
  verifyToken,
  requireExco,
  excoController.deleteStudent
);

router.get(
  "/users/search",
  verifyToken,
  requireExco,
  excoController.searchUsers
);

module.exports = router;
