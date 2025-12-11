// backend/controllers/bookingController.js
const Booking = require("../models/Booking");
const Facility = require("../models/Facility");
const Notification = require("../models/Notification");
const User = require("../models/User");
const moment = require("moment-timezone");

// use Malaysia timezone everywhere
const TZ = "Asia/Kuala_Lumpur";

// Helper: check if two intervals overlap (A.start < B.end && B.start < A.end)
function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// convert dateStr ("YYYY-MM-DD") and timeStr ("HH:mm") in TZ into JS Date
function makeDateTime(dateStr, timeStr) {
  // parse in TZ then convert to JS Date
  const m = moment.tz(`${dateStr} ${timeStr}`, "YYYY-MM-DD HH:mm", TZ);
  return m.isValid() ? m.toDate() : null;
}

/**
 * POST /api/bookings/check-availability
 * body: { facilityId, slots: [{ date: "YYYY-MM-DD", time: "HH:mm", durationMinutes: optional }] }
 * returns { available: boolean, slotResults: [{ date, time, available }] }
 */
exports.checkAvailability = async (req, res) => {
  try {
    const { facilityId, slots } = req.body;
    if (!facilityId || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "facilityId and slots required" });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ message: "Facility not found" });

    // if facility in maintenance - not available
    if (facility.status === "maintenance" || facility.status === "in_maintenance") {
      return res.json({ available: false, reason: "facility_in_maintenance" });
    }

    const results = [];

    for (const s of slots) {
      const { date, time, durationMinutes = 60 } = s;
      const startAt = makeDateTime(date, time);
      if (!startAt) {
        results.push({ date, time, available: false, reason: "invalid_datetime" });
        continue;
      }
      const endAt = moment(startAt).add(durationMinutes, "minutes").toDate();

      // find any booking that overlaps this interval and is pending/approved/booked
      const conflicts = await Booking.findOne({
        facilityId,
        status: { $in: ["pending", "approved", "booked"] },
        $or: [
          // existing.start < new.end && existing.end > new.start
          { startAt: { $lt: endAt }, endAt: { $gt: startAt } },
        ],
      }).lean();

      if (conflicts) {
        results.push({ date, time, available: false, reason: "conflict", conflictId: conflicts._id });
      } else {
        results.push({ date, time, available: true });
      }
    }

    const available = results.every(r => r.available === true);
    return res.json({ available, slotResults: results });
  } catch (err) {
    console.error("checkAvailability error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/bookings
 * Create one or multiple bookings (slots)
 * body: { facilityId, slots: [{ date: "YYYY-MM-DD", time: "HH:mm", durationMinutes?: number, equipmentRequests?: [{equipmentId, quantity, reason}] }], reason }
 */
exports.createBooking = async (req, res) => {
  try {
    const user = req.user; // from auth middleware (should contain userId, firstName, lastName)
    const { facilityId, slots, reason, equipmentRequests = [] } = req.body;
    if (!facilityId || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "facilityId and slots required" });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ message: "Facility not found" });

    if (facility.status === "maintenance" || facility.status === "in_maintenance") {
      return res.status(400).json({ message: "Facility currently in maintenance" });
    }

    // Validate slots and check conflicts in batch
    const createdBookings = [];
    for (const s of slots) {
      const { date, time, durationMinutes = 60 } = s;
      const startAt = makeDateTime(date, time);
      if (!startAt) return res.status(400).json({ message: "Invalid slot date/time" });
      const endAt = moment(startAt).add(durationMinutes, "minutes").toDate();

      // check conflict
      const conflict = await Booking.findOne({
        facilityId,
        status: { $in: ["pending", "approved", "booked"] },
        $or: [{ startAt: { $lt: endAt }, endAt: { $gt: startAt } }],
      }).lean();

      if (conflict) {
        return res.status(409).json({
          message: "Time conflict with existing booking",
          conflict: { id: conflict._id, startAt: conflict.startAt, endAt: conflict.endAt },
        });
      }

      // prepare equipmentRequests denormalized (lookup name if provided)
      const eqReqs = Array.isArray(s.equipmentRequests && s.equipmentRequests.length ? s.equipmentRequests : equipmentRequests)
        ? (s.equipmentRequests && s.equipmentRequests.length ? s.equipmentRequests : equipmentRequests)
        : [];

      // build denormalized equipmentRequests array (if equipmentId present)
      const denormEquipment = eqReqs.map(er => ({
        equipmentId: er.equipmentId,
        equipmentName: er.equipmentName || er.name || "",
        quantity: er.quantity || 1,
        reason: er.reason || "",
      }));

      const booking = new Booking({
        facilityId,
        coachId: user.userId || user._id,
        coachName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        startAt,
        endAt,
        equipmentRequests: denormEquipment,
        reason,
        createdBy: user.userId || user._id,
      });

      await booking.save();
      createdBookings.push(booking);

      // notify exco(s)
      const excos = await User.find({ role: "exco" }).lean();
      await Promise.all(excos.map(ex => Notification.create({
        toUser: ex._id,
        title: "New facility booking request",
        message: `${booking.coachName} requested ${facility.name} on ${moment(startAt).tz("Asia/Kuala_Lumpur").format("YYYY-MM-DD HH:mm")} - ${moment(endAt).tz("Asia/Kuala_Lumpur").format("HH:mm")}`,
        meta: { bookingId: booking._id }
      })));
    }

    return res.status(201).json({ bookings: createdBookings });
  } catch (err) {
    console.error("createBooking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/bookings/coach - list coach bookings (paginated)
 */
exports.getCoachBookings = async (req, res) => {
  try {
    const coachId = req.user.userId || req.user._id;
    let { page = 1, limit = 20 } = req.query;
    page = Number(page); limit = Number(limit);
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ coachId }).sort({ startAt: -1 }).skip(skip).limit(limit).lean(),
      Booking.countDocuments({ coachId }),
    ]);

    return res.json({ bookings, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    console.error("getCoachBookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/bookings/pending - EXCO list
 */
exports.getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "pending" }).populate("facilityId").lean();
    return res.json({ bookings });
  } catch (err) {
    console.error("getPendingBookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/bookings/:id/approve
 * body: { approve: true/false }
 */
exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;
    const exco = req.user;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (approve) {
      booking.status = "approved";
      booking.approvedBy = exco.userId || exco._id;
      booking.approvedAt = new Date();
      await booking.save();

      // create notification to coach
      await Notification.create({
        toUser: booking.coachId,
        title: "Booking approved",
        message: `Your booking for ${moment(booking.startAt).tz(TZ).format("YYYY-MM-DD HH:mm")} has been approved.`,
        meta: { bookingId: booking._id }
      });

      return res.json({ booking });
    } else {
      booking.status = "rejected";
      await booking.save();
      await Notification.create({
        toUser: booking.coachId,
        title: "Booking rejected",
        message: `Your booking for ${moment(booking.startAt).tz(TZ).format("YYYY-MM-DD HH:mm")} has been rejected.`,
        meta: { bookingId: booking._id }
      });
      return res.json({ booking });
    }
  } catch (err) {
    console.error("approveBooking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
