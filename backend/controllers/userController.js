const User = require("../models/User");

exports.searchUsers = async (req, res) => {
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
};
