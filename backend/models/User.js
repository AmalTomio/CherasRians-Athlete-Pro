// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "coach", "exco"],
      required: true,
      index: true,
    },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    staffId: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    nricEncrypted: { type: String },

    sport: { type: String, index: true }, // coaches + student filtering
    year: { type: Number, index: true },
    classGroup: { type: String, index: true },

    isActive: { type: Boolean, default: true, index: true },

    // Profile fields
    bod: { type: Date }, // Date of birth
    profileUrl: { type: String, default: "" }, // Profile picture URL
    gender: { type: String, default: "" }, // Gender
    age: { type: Number }, // Coach age
    height: { type: Number }, // Student height (cm)
    weight: { type: Number }, // Student weight (kg)

    // Coach assignment fields
    category: { type: String, default: "", index: true },
    position: { type: String, default: "" },
    badmintonCategory: { type: String, default: "" },

    status: { type: String, default: "active", index: true },

    /* ================= AUTH ================= */

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
    },

    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, sport: 1 }); // For coach fetching own players
userSchema.index({ role: 1, year: 1 }); // Year filtering
userSchema.index({ role: 1, classGroup: 1 }); // Class filtering

// Searching by student name
userSchema.index({ firstName: "text", lastName: "text" });

module.exports = mongoose.model("User", userSchema);
