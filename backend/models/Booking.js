// backend/models/Booking.js
const mongoose = require("mongoose");

const equipmentRequestSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    equipmentName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "partially_approved"],
      default: "pending",
    },
    approvedQuantity: { type: Number, default: 0 },
    notes: { type: String },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coachName: { type: String },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    // multiple equipment requests per booking
    equipmentRequests: [equipmentRequestSchema],

    // status: pending -> approved / rejected / cancelled
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    reason: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // exco approval metadata
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },

    equipmentReleased: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes to speed up conflict checks and common queries
bookingSchema.index({ facilityId: 1, startAt: 1, endAt: 1 });
bookingSchema.index({ coachId: 1, startAt: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
