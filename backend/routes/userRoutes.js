const express = require("express");
const router = express.Router();
const User = require("../models/User");

const { verifyToken } = require("../middleware/authMiddleware");

router.get("/me", verifyToken, async (req, res) => {
  res.json(req.user);
});

router.put("/me", verifyToken, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    req.body,
    { new: true }
  );
  res.json(user);
});

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

    res.json({ users });
  } catch (err) {
    console.error("SEARCH USERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
