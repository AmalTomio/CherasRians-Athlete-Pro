const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");
const uploadProfile = require("../middleware/uploadProfile");


/* ================= CONSTANTS ================= */
const COMMON_EDITABLE = ["firstName", "lastName", "email", "bod"];
const COACH_EDITABLE = ["age"];
const STUDENT_EDITABLE = ["height", "weight"];

/* ================= UTIL ================= */
const sanitizeUser = (user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : user;
  delete obj.nricEncrypted;
  delete obj.staffId;
  delete obj.__v;
  return obj;
};

/* ================= GET PROFILE ================= */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      data: sanitizeUser(user),
    });
  } catch (err) {
    console.error("GET /users/me ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/* ================= UPDATE PROFILE ================= */
router.put("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).json({ message: "User not found." });
    }

    /* ===== BUILD ALLOWED FIELDS ===== */
    let allowed = [...COMMON_EDITABLE];

    if (userDoc.role === "coach") {
      allowed = allowed.concat(COACH_EDITABLE);
    }

    if (userDoc.role === "student") {
      allowed = allowed.concat(STUDENT_EDITABLE);
    }

    /* ===== APPLY WHITELIST ===== */
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    /* ===== VALIDATE EMAIL ===== */
    if (updates.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(updates.email)) {
        return res.status(400).json({ message: "Invalid email format." });
      }

      const existing = await User.findOne({
        email: updates.email,
        _id: { $ne: userId },
      });

      if (existing) {
        return res.status(400).json({ message: "Email is already taken." });
      }
    }

    /* ===== SAFE NUMBER CONVERSION ===== */
    if (updates.age !== undefined) {
      updates.age = Number(updates.age);
      if (isNaN(updates.age)) delete updates.age;
    }

    if (updates.height !== undefined) {
      updates.height = Number(updates.height);
      if (isNaN(updates.height)) delete updates.height;
    }

    if (updates.weight !== undefined) {
      updates.weight = Number(updates.weight);
      if (isNaN(updates.weight)) delete updates.weight;
    }

    /* ===== UPDATE ===== */
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    return res.json({
      data: sanitizeUser(updatedUser),
      message: "Profile updated successfully.",
    });
  } catch (err) {
    console.error("PUT /users/me ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/* ================= UPLOAD AVATAR ================= */
router.post(
  "/me/avatar",
  verifyToken,
  uploadProfile.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided." });
      }

      const userId = req.user._id || req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const profileUrl = req.file.path;

      user.profileUrl = profileUrl;
      await user.save();

      return res.json({
        data: sanitizeUser(user),
        message: "Profile picture updated.",
      });
    } catch (err) {
      console.error("POST /users/me/avatar ERROR:", err);
      return res.status(500).json({ message: "Server error." });
    }
  },
);

/* ================= SEARCH USERS ================= */
router.get("/search", verifyToken, async (req, res) => {
  try {
    const { search = "" } = req.query;

    if (!search.trim()) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      role: { $in: ["student", "coach"] },
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ],
    })
      .select("_id firstName lastName role sport category")
      .limit(10)
      .lean();

    return res.json({ users });
  } catch (err) {
    console.error("SEARCH USERS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
