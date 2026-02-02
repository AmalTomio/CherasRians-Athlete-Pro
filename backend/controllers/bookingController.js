const Booking = require("../models/Booking");
const Facility = require("../models/Facility");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Schedule = require("../models/Schedule");
const Equipment = require("../models/Equipment");

const moment = require("moment-timezone");
const TZ = "Asia/Kuala_Lumpur";

/* ================= CHECK AVAILABILITY ================= */

exports.checkAvailability = async (req, res) => {
  try {
    const { facilityId, slots } = req.body;

    if (!facilityId || !Array.isArray(slots) || slots.length === 0) {
      return res
        .status(400)
        .json({ message: "Facility ID and slots required" });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    if (["maintenance", "in_maintenance"].includes(facility.status)) {
      return res.json({ available: false, reason: "facility_in_maintenance" });
    }

    const results = [];

    for (const slot of slots) {
      const { date, startTime, endTime } = slot;

      const startAt = moment
        .tz(`${date} ${startTime}`, "YYYY-MM-DD HH:mm", TZ)
        .toDate();
      const endAt = moment
        .tz(`${date} ${endTime}`, "YYYY-MM-DD HH:mm", TZ)
        .toDate();

      if (!startAt || !endAt || endAt <= startAt) {
        results.push({ date, available: false, reason: "invalid_datetime" });
        continue;
      }

      const bookingConflict = await Booking.findOne({
        facilityId,
        status: { $in: ["pending", "approved"] },
        startAt: { $lt: endAt },
        endAt: { $gt: startAt },
      });

      if (bookingConflict) {
        results.push({ date, available: false, reason: "booking_conflict" });
        continue;
      }

      results.push({ date, available: true });
    }

    return res.json({
      available: results.every((r) => r.available),
      slotResults: results,
    });
  } catch (err) {
    console.error("checkAvailability error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= CREATE BOOKING (COACH) ================= */

exports.createBooking = async (req, res) => {
  try {
    const user = req.user;
    const {
      facilityId,
      slots,
      sessionType,
      sessionTitle,
      playerCategory,
      reason,
      equipmentRequests = [],
    } = req.body;

    // Basic required fields
    if (!sessionType || !sessionTitle) {
      return res.status(400).json({
        message: "Session type and title are required",
      });
    }

    // Category REQUIRED only for training / tryout
    const requiresCategory = ["training", "tryout"].includes(sessionType);
    if (requiresCategory && !playerCategory) {
      return res.status(400).json({
        message: "Player category is required for training and tryout sessions",
      });
    }

    if (!facilityId || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "facilityId and slots required" });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    const createdBookings = [];

    for (const s of slots) {
      const { date, startTime, endTime } = s;

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

      const denormEquipment = (equipmentRequests || [])
        .filter((er) => er.quantity > 0)
        .map((er) => ({
          equipmentId: er.equipmentId,
          equipmentName: er.equipmentName,
          quantity: er.quantity,
        }));

      const booking = new Booking({
        facilityId,
        coachId: user._id,
        coachName: `${user.firstName} ${user.lastName}`,
        startAt,
        endAt,
        sessionType,
        sessionTitle,
        playerCategory: requiresCategory ? playerCategory : null,
        equipmentRequests: denormEquipment,
        reason,
        createdBy: user._id,
      });

      // Reserve equipment
      for (const er of denormEquipment) {
        const equipment = await Equipment.findById(er.equipmentId);
        if (!equipment) {
          return res.status(400).json({ message: "Invalid equipment" });
        }

        if (er.quantity > equipment.quantityAvailable) {
          return res.status(400).json({
            message: `${equipment.name} has insufficient stock`,
          });
        }

        await Equipment.findByIdAndUpdate(equipment._id, {
          $inc: { quantityAvailable: -er.quantity },
        });
      }

      await booking.save();
      createdBookings.push(booking);

      const excos = await User.find({ role: "exco" });
      await Promise.all(
        excos.map((ex) =>
          Notification.create({
            toUser: ex._id,
            title: "New facility booking request",
            message: `${booking.coachName} requested ${facility.name}`,
            meta: { bookingId: booking._id },
          }),
        ),
      );
    }

    res.status(201).json({ bookings: createdBookings });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= APPROVE / REJECT (EXCO) ================= */

exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;
    const exco = req.user;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!approve) {
      booking.status = "rejected";
      await booking.save();
      return res.json({ booking });
    }

    booking.status = "approved";
    booking.approvedBy = exco._id;
    booking.approvedAt = new Date();
    await booking.save();

    const coach = await User.findById(booking.coachId).lean();

    const sessionDate = moment(booking.startAt).tz(TZ).startOf("day").toDate();

    const schedule = await Schedule.create({
      coachId: booking.coachId,
      sport: coach.sport,
      facilityId: booking.facilityId,
      playerCategory: booking.playerCategory,
      title: booking.sessionTitle,
      sessionType: booking.sessionType,
      sessionDate,
      startTime: moment(booking.startAt).tz(TZ).format("HH:mm"),
      endTime: moment(booking.endAt).tz(TZ).format("HH:mm"),
      status: "approved",
    });

    const { sendNotification } = require("../services/notificationService");

    await sendNotification({
      io: req.app.get("io"),
      toUser: booking.coachId,
      title: "Booking Approved",
      message: "Your facility booking has been approved.",
      meta: {
        bookingId: booking._id,
        scheduleId: schedule._id,
      },
    });

    res.json({ booking, schedule });
  } catch (err) {
    console.error("approveBooking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET COACH BOOKINGS ================= */

exports.getCoachBookings = async (req, res) => {
  try {
    const coachId = req.user._id;

    const bookings = await Booking.find({ coachId })
      .populate("facilityId", "name")
      .sort({ startAt: -1 })
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
      .populate("facilityId", "name")
      .populate("coachId", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ bookings });
  } catch (err) {
    console.error("getPendingBookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/* ================= GET ALL BOOKINGS (EXCO) ================= */

exports.getAllBookings = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", status = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const filter = {};

    if (status) {
      const statuses = status.split(",");
      if (statuses.length > 1) {
        filter.status = { $in: statuses };
      } else {
        filter.status = status;
      }
    }

    let bookingsQuery = Booking.find(filter)
      .populate("facilityId", "name")
      .populate("coachId", "firstName lastName")
      .sort({ createdAt: -1 });

    const allMatching = await bookingsQuery.lean();

    let filteredBookings = allMatching.map((b) => ({
      ...b,
      coachName: b.coachId
        ? `${b.coachId.firstName} ${b.coachId.lastName}`
        : "Unknown",
      facilityName: b.facilityId ? b.facilityId.name : "Unknown",
    }));

    if (search) {
      const q = search.toLowerCase();
      filteredBookings = filteredBookings.filter(
        (b) =>
          b.coachName.toLowerCase().includes(q) ||
          b.facilityName.toLowerCase().includes(q),
      );
    }

    const total = filteredBookings.length;
    const paginatedBookings = filteredBookings.slice(skip, skip + limit);

    res.json({
      bookings: paginatedBookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("GET ALL BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
