const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Present", "Late", "Absent", "Injured", "Excused"],
    required: true,
  },
  remarks: String,
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recordedAt: Date,
});

module.exports = mongoose.model("Attendance", attendanceSchema);
