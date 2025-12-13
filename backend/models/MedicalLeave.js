const mongoose = require("mongoose");

const medicalLeaveSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    studentName: { type: String, required: true },
    studentId: { type: String, required: true },
    team: { type: String },
    sport: { type: String },
    
    // Leave period
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number },
    
    reason: { type: String, default: "" },
    
    // File stored as Base64 in database
    fileData: { 
      type: String, // Base64 encoded file
      required: true
    },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number },
    
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    coachName: { type: String },
    coachRemarks: { type: String, default: "" },
    verifiedAt: { type: Date },
    
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalLeave", medicalLeaveSchema);