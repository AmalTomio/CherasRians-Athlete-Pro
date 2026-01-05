// backend/controllers/equipmentController.js
const Equipment = require("../models/Equipment");
const EquipmentRequest = require("../models/EquipmentRequest");
const DamageReport = require("../models/EquipmentDamageReport");
const Booking = require("../models/Booking");
const User = require("../models/User");

// List all equipment (open to authenticated users)
exports.getEquipmentList = async (req, res) => {
  try {
    const items = await Equipment.find().sort({ name: 1 }).lean();
    res.json({ equipment: items });
  } catch (err) {
    console.error("Get equipment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// equipmentController.js
exports.getAvailableEquipment = async (req, res) => {
  try {
    const items = await Equipment.find({
      isActive: true,
      quantityAvailable: { $gt: 0 },
    }).sort({ name: 1 });

    res.json(items);
  } catch (err) {
    console.error("Get available equipment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create equipment (EXCO)
exports.createEquipment = async (req, res) => {
  try {
    const {
      name,
      category,
      quantityTotal = 0,
    } = req.body;

    if (!name || !category || quantityTotal == null) {
      return res.status(400).json({
        message: "Name, category and quantity are required",
      });
    }

    const newItem = await Equipment.create({
      name,
      category,
      quantityTotal,
      quantityAvailable: quantityTotal,
      createdBy: req.user?.userId || req.user?._id,
    });

    res.status(201).json({
      message: "Equipment added",
      item: newItem,
    });
  } catch (err) {
    console.error("Create equipment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Coach: request equipment for a booking/session
exports.requestEquipment = async (req, res) => {
  try {
    const coachId = req.user.userId;
    const {
      equipmentId,
      quantityRequested,
      scheduleId,
      reason = "",
    } = req.body;

    // 1️⃣ Basic validation
    if (!equipmentId || !quantityRequested || quantityRequested < 1) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // 2️⃣ Validate equipment
    const eq = await Equipment.findById(equipmentId);
    if (!eq) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    if (quantityRequested > eq.quantityAvailable) {
      return res.status(400).json({
        message: `Only ${eq.quantityAvailable} available`,
      });
    }

    // 3️⃣ 🔥 VALIDATE BOOKING LINK (THIS IS YOUR QUESTION)
    if (scheduleId) {
      const booking = await Booking.findById(scheduleId);
      if (!booking) {
        return res.status(400).json({ message: "Invalid booking reference" });
      }

      // Optional but GOOD: ensure coach owns this booking
      if (String(booking.coachId) !== String(coachId)) {
        return res
          .status(403)
          .json({
            message: "You can only request equipment for your own booking",
          });
      }
    }

    // 4️⃣ Create request
    const request = await EquipmentRequest.create({
      coachId,
      equipmentId,
      quantityRequested,
      scheduleId,
      reason,
      status: "pending",
    });

    // 5️⃣ Done
    res.status(201).json({
      message: "Equipment request submitted",
      request,
    });
  } catch (err) {
    console.error("Equipment request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Coach: report equipment damage
exports.reportDamage = async (req, res) => {
  try {
    const reporter = req.user?.userId || req.user?._id;
    const {
      equipmentId,
      quantityDamaged,
      description = "",
      severity = "low",
      scheduleId,
    } = req.body;

    if (!equipmentId || !quantityDamaged) {
      return res
        .status(400)
        .json({ message: "Missing equipmentId or quantityDamaged" });
    }

    const eq = await Equipment.findById(equipmentId);
    if (!eq) return res.status(404).json({ message: "Equipment not found" });

    const report = await DamageReport.create({
      equipmentId,
      reportedBy: reporter,
      scheduleId,
      quantityDamaged,
      damageDescription: description,
      severity,
      status: "reported",
    });

    // update equipment counters (decrement available, increment damaged)
    await Equipment.findByIdAndUpdate(equipmentId, {
      $inc: {
        quantityDamaged: quantityDamaged,
        quantityAvailable: -Math.abs(quantityDamaged),
      },
    });

    return res.status(201).json({ message: "Damage report submitted", report });
  } catch (err) {
    console.error("Damage report error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// EXCO: list pending equipment requests
exports.listRequests = async (req, res) => {
  try {
    const requests = await EquipmentRequest.find()
      .populate("equipmentId coachId")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ requests });
  } catch (err) {
    console.error("List equipment requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// EXCO: process (approve/reject) equipment request
exports.processRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, approvedQuantity = 0, notes = "" } = req.body; // action: 'approve' | 'reject' | 'partial'
    const excoId = req.user?.userId || req.user?._id;

    const reqDoc = await EquipmentRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ message: "Request not found" });

    if (reqDoc.status !== "pending") {
      return res.status(400).json({
        message: `Request already ${reqDoc.status}`,
      });
    }

    if (action === "approve") {
      // deduct from equipment available (if enough)
      const equip = await Equipment.findById(reqDoc.equipmentId);
      if (!equip)
        return res.status(404).json({ message: "Equipment not found" });

      const qtyToApprove = Math.min(
        reqDoc.quantityRequested,
        approvedQuantity || reqDoc.quantityRequested
      );
      if (qtyToApprove > equip.quantityAvailable) {
        return res
          .status(400)
          .json({ message: "Not enough equipment available" });
      }

      // update equipment
      await Equipment.findByIdAndUpdate(equip._id, {
        $inc: { quantityAvailable: -qtyToApprove },
      });

      reqDoc.status = "approved";
      reqDoc.processedBy = excoId;
      reqDoc.processedAt = new Date();
      reqDoc.notes = notes;
      await reqDoc.save();

      return res.json({ message: "Request approved", request: reqDoc });
    } else if (action === "partial") {
      // partially approve some quantity
      const equip = await Equipment.findById(reqDoc.equipmentId);
      if (!equip)
        return res.status(404).json({ message: "Equipment not found" });

      const qtyToApprove = Math.min(approvedQuantity, equip.quantityAvailable);
      if (qtyToApprove <= 0) {
        return res
          .status(400)
          .json({ message: "No quantity available to approve" });
      }

      await Equipment.findByIdAndUpdate(equip._id, {
        $inc: { quantityAvailable: -qtyToApprove },
      });

      reqDoc.status = "partially_approved";
      reqDoc.processedBy = excoId;
      reqDoc.processedAt = new Date();
      reqDoc.notes = notes;
      await reqDoc.save();

      return res.json({
        message: "Request partially approved",
        request: reqDoc,
      });
    } else {
      // reject
      reqDoc.status = "rejected";
      reqDoc.processedBy = excoId;
      reqDoc.processedAt = new Date();
      reqDoc.notes = notes;
      await reqDoc.save();
      return res.json({ message: "Request rejected", request: reqDoc });
    }
  } catch (err) {
    console.error("Process equipment request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
