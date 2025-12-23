const Booking = require("../models/Booking");
const Facility = require("../models/Facility");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Schedule = require("../models/Schedule");
const moment = require("moment-timezone");

const TZ = "Asia/Kuala_Lumpur";

/* ================= UTILITIES ================= */

function makeDateTime(dateStr, timeStr) {
  const m = moment.tz(`${dateStr} ${timeStr}`, "YYYY-MM-DD HH:mm", TZ);
  return m.isValid() ? m.toDate() : null;
}

/* ================= CHECK AVAILABILITY ================= */

exports.checkAvailability = async (req, res) => {
  try {
    const { facilityId, slots } = req.body;

    if (!facilityId || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "facilityId and slots required" });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    if (
      facility.status === "maintenance" ||
      facility.status === "in_maintenance"
    ) {
      return res.json({ available: false, reason: "facility_in_maintenance" });
    }

    const results = [];

    for (const s of slots) {
      const { date, startTime, endTime } = s;

      if (!date || !startTime || !endTime) {
        results.push({
          date,
          available: false,
          reason: "invalid_datetime",
        });
        continue;
      }

      const startAt = moment
        .tz(`${date} ${startTime}`, "YYYY-MM-DD HH:mm", TZ)
        .toDate();

      const endAt = moment
        .tz(`${date} ${endTime}`, "YYYY-MM-DD HH:mm", TZ)
        .toDate();

      if (endAt <= startAt) {
        results.push({
          date,
          available: false,
          reason: "end_before_start",
        });
        continue;
      }
    }

    const available = results.every((r) => r.available);
    return res.json({ available, slotResults: results });
  } catch (err) {
    console.error("checkAvailability error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= CREATE BOOKING ================= */

exports.createBooking = async (req, res) => {
  try {
    const user = req.user;
    const { facilityId, slots, reason, equipmentRequests = [] } = req.body;

    if (!facilityId || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "facilityId and slots required" });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    if (
      facility.status === "maintenance" ||
      facility.status === "in_maintenance"
    ) {
      return res
        .status(400)
        .json({ message: "Facility currently in maintenance" });
    }

    const createdBookings = [];

    for (const s of slots) {
      const { date, startTime, endTime } = s;

      if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: "Invalid slot date/time" });
      }

      const startAt = moment
        .tz(`${date} ${startTime}`, "YYYY-MM-DD HH:mm", TZ)
        .toDate();

      const endAt = moment
        .tz(`${date} ${endTime}`, "YYYY-MM-DD HH:mm", TZ)
        .toDate();

      if (!startAt || !endAt || endAt <= startAt) {
        return res.status(400).json({
          message: "End time must be after start time",
        });
      }

      const denormEquipment = equipmentRequests.map((er) => ({
        equipmentId: er.equipmentId,
        equipmentName: er.equipmentName || "",
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

      const excos = await User.find({ role: "exco" }).lean();
      await Promise.all(
        excos.map((ex) =>
          Notification.create({
            toUser: ex._id,
            title: "New facility booking request",
            message: `${booking.coachName} requested ${
              facility.name
            } on ${moment(startAt)
              .tz(TZ)
              .format("YYYY-MM-DD HH:mm")} - ${moment(endAt)
              .tz(TZ)
              .format("HH:mm")}`,
            meta: { bookingId: booking._id },
          })
        )
      );
    }

    res.status(201).json({ bookings: createdBookings });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET COACH BOOKINGS ================= */

exports.getCoachBookings = async (req, res) => {
  try {
    const coachId = req.user.userId || req.user._id;

    const bookings = await Booking.find({ coachId })
      .sort({ startAt: -1 })
      .populate("facilityId")
      .lean();

    res.json({ bookings });
  } catch (err) {
    console.error("getCoachBookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET PENDING BOOKINGS (EXCO) ================= */

exports.getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "pending" })
      .populate("facilityId")
      .lean();

    res.json({ bookings });
  } catch (err) {
    console.error("getPendingBookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= APPROVE / REJECT BOOKING ================= */

exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;
    const exco = req.user;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    /* ===== REJECT ===== */
    if (!approve) {
      booking.status = "rejected";
      await booking.save();

      await Notification.create({
        toUser: booking.coachId,
        title: "Booking rejected",
        message: `Your booking for ${moment(booking.startAt)
          .tz(TZ)
          .format("YYYY-MM-DD HH:mm")} has been rejected.`,
        meta: { bookingId: booking._id },
      });

      return res.json({ booking });
    }

    /* ===== APPROVE ===== */
    booking.status = "approved";
    booking.approvedBy = exco.userId || exco._id;
    booking.approvedAt = new Date();
    await booking.save();

    // ONLY these reasons create attendance sessions
    const attendanceReasons = ["training", "tryout"];
    let schedule = null;

    if (attendanceReasons.includes(booking.reason)) {
      const sessionDate = moment(booking.startAt)
        .tz(TZ)
        .startOf("day")
        .toDate();

      const exists = await Schedule.findOne({
        coachId: booking.coachId,
        facilityId: booking.facilityId,
        sessionDate,
        startTime: moment(booking.startAt).tz(TZ).format("HH:mm"),
      });

      if (!exists) {
        schedule = await Schedule.create({
          coachId: booking.coachId,
          facilityId: booking.facilityId,
          sessionDate,
          startTime: moment(booking.startAt).tz(TZ).format("HH:mm"),
          endTime: moment(booking.endAt).tz(TZ).format("HH:mm"),
          reason: booking.reason,
          sessionType: booking.reason,
          status: "approved",
        });
      }
    }

    await Notification.create({
      toUser: booking.coachId,
      title: "Booking approved",
      message: `Your booking for ${moment(booking.startAt)
        .tz(TZ)
        .format("YYYY-MM-DD HH:mm")} has been approved.`,
      meta: {
        bookingId: booking._id,
        scheduleId: schedule?._id || null,
      },
    });

    res.json({ booking, scheduleCreated: !!schedule, schedule });
  } catch (err) {
    console.error("approveBooking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
