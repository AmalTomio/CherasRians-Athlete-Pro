// backend/controllers/facilityController.js

const Facility = require("../models/Facility");
const FacilityMaintenance = require("../models/FacilityMaintenance");

// GET all facilities
exports.getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find().sort({ name: 1 });
    res.json({ facilities });
  } catch (err) {
    console.error("Get facilities error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE new facility (Exco only)
exports.createFacility = async (req, res) => {
  try {
    const { name, status } = req.body;
    const facility = await Facility.create({ name, status });
    res.json({ message: "Facility created", facility });
  } catch (err) {
    console.error("Create facility error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE facility status
exports.updateFacilityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const facility = await Facility.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!facility) return res.status(404).json({ message: "Facility not found" });

    res.json({ message: "Status updated", facility });
  } catch (err) {
    console.error("Update facility status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOG maintenance record
exports.addMaintenance = async (req, res) => {
  try {
    const { facilityId, excoId, startDate, endDate, reason } = req.body;

    const record = await FacilityMaintenance.create({
      facilityId,
      excoId,
      startDate,
      endDate,
      reason,
    });

    // Set facility to maintenance mode
    await Facility.findByIdAndUpdate(facilityId, { status: "maintenance" });

    res.json({ message: "Maintenance recorded", record });

  } catch (err) {
    console.error("Add maintenance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
