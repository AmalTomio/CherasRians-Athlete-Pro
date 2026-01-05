const express = require("express");
const router = express.Router();

const {
  getFacilities,
  createFacility,
  updateFacility,
  updateFacilityStatus,
  addMaintenance,
} = require("../controllers/facilityController");

const { deleteFacility } = require("../controllers/facilityController");

// GET all facilities
router.get("/", getFacilities);

// CREATE facility (EXCO ONLY)
router.post("/", createFacility);

router.put("/:id", updateFacility);

// UPDATE facility status
router.put("/:id/status", updateFacilityStatus);

// ADD maintenance record
router.post("/maintenance", addMaintenance);

router.delete("/:id", deleteFacility);

module.exports = router;
