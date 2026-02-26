const Booking = require("../models/Booking");
const EquipmentBorrow = require("../models/EquipmentBorrow");
const Equipment = require("../models/Equipment");

const { sendNotification } = require("../services/notificationService");

exports.releaseEquipment = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!booking.equipmentRequests?.length)
      return res.json({ message: "No equipment to release" });

    // 🔵 Create borrow record
    await EquipmentBorrow.create({
      bookingId: booking._id,
      coachId: booking.coachId,
      items: booking.equipmentRequests.map((r) => ({
        equipmentId: r.equipmentId,
        quantity: r.quantity,
      })),
      dueAt: booking.endAt,
      status: "borrowed",
    });

    booking.equipmentReleased = true;
    await booking.save();

    res.json({ message: "Equipment released" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Release error" });
  }
};

exports.submitReturn = async (req, res) => {
  try {
    const borrowId = req.params.borrowId;
    const coachId = req.user._id;

    const borrow = await EquipmentBorrow.findOne({
      _id: borrowId,
      coachId,
    });

    if (!borrow)
      return res.status(404).json({ message: "Borrow record not found" });

    borrow.status = "return_submitted";
    borrow.returnedAt = new Date();

    // 🔵 NEW — proof file
    if (req.file) {
      borrow.returnProof = req.file.filename;
    }

    await borrow.save();

    const excos = await User.find({ role: "exco" });

    for (const exco of excos) {
      await sendNotification({
        io: req.app.get("io"),
        toUser: exco._id,
        title: "Return Submitted",
        message: "Coach submitted equipment return proof",
        meta: { borrowId: borrow._id },
      });
    }

    res.json({ message: "Return submitted" });
  } catch (err) {
    res.status(500).json({ message: "Error submitting return" });
  }
};

exports.verifyReturn = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const { approve, notes } = req.body;
    const exco = req.user;

    const borrow = await EquipmentBorrow.findById(borrowId);

    if (!borrow)
      return res.status(404).json({ message: "Borrow record not found" });

    if (borrow.status !== "return_submitted")
      return res.status(400).json({ message: "Return not submitted yet" });

    if (!approve) {
      borrow.status = "rejected";
      borrow.notes = notes || "";
      await borrow.save();

      return res.json({ message: "Return rejected", borrow });
    }

    // Restore inventory
    await Equipment.findByIdAndUpdate(borrow.equipmentId, {
      $inc: { quantityAvailable: borrow.quantity },
    });

    borrow.status = "verified";
    borrow.verifiedBy = exco._id;
    borrow.verifiedAt = new Date();
    borrow.notes = notes || "";

    await borrow.save();

    const { sendNotification } = require("../services/notificationService");

    await sendNotification({
      io: req.app.get("io"),
      toUser: borrow.coachId,
      title: "Return Verified",
      message: "Your equipment return has been verified.",
      meta: { borrowId },
    });

    res.json({
      message: "Return verified successfully",
      borrow,
    });
  } catch (err) {
    console.error("Verify Return Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPendingReturns = async (req, res) => {
  try {
    const borrows = await EquipmentBorrow.find({
      status: { $in: ["return_submitted", "overdue"] },
    })
      .populate("coachId", "firstName lastName")
      .populate("bookingId", "sessionTitle startAt endAt")
      .sort({ dueAt: 1 })
      .lean();

    res.json({ borrows });
  } catch (err) {
    console.error("Get Pending Returns Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCoachReturns = async (req, res) => {
  try {
    const coachId = req.user._id;

    const borrows = await EquipmentBorrow.find({
      coachId,
      status: { $in: ["borrowed", "overdue"] },
    })
      .populate("bookingId", "sessionTitle startAt endAt")
      .sort({ dueAt: 1 })
      .lean();

    res.json({ borrows });
  } catch (err) {
    console.error("Get Coach Returns Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
