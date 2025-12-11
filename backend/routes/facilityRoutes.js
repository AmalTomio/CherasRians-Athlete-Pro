// backend/routes/facilityRoutes.js
const express = require("express");
const router = express.Router();

const {
  getFacilities,
  createFacility,
  updateFacilityStatus,
  addMaintenance,
} = require("../controllers/facilityController");

// Example: protect routes with auth middleware (optional)
// const { authMiddleware, excoMiddleware } = require("../middleware/auth");

// GET all facilities
router.get("/", getFacilities);

// CREATE facility (EXCO ONLY)
// router.post("/", authMiddleware, excoMiddleware, createFacility);
router.post("/", createFacility);

// UPDATE facility status
router.put("/:id/status", updateFacilityStatus);

// ADD maintenance record
router.post("/maintenance", addMaintenance);

module.exports = router;
