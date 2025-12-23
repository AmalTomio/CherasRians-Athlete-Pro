const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { verifyToken, requireCoach, requireExco } = require("../middleware/authMiddleware");

// check availability (coach)
router.post("/check-availability", verifyToken, requireCoach, bookingController.checkAvailability);

// create bookings (coach)
router.post("/", verifyToken, requireCoach, bookingController.createBooking);

// coach list own bookings
router.get("/coach", verifyToken, requireCoach, bookingController.getCoachBookings);

// exco pending bookings
router.get("/pending", verifyToken, requireExco, bookingController.getPendingBookings);

// approve/reject
router.put("/:id/approve", verifyToken, requireExco, bookingController.approveBooking);

module.exports = router;
