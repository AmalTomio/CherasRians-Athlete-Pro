const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },

    sessionDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    equipment: [{ type: String }], 
    reason: { type: String },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    sessionType: {
  type: String,
  enum: ["training", "practice", "tryout", "event", "meeting"],
  required: true
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
