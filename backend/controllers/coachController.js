const User = require("../models/User");

// Helper to format status for frontend
const formatStatus = (status) => {
  switch (status) {
    case "active":
      return "Active";
    case "injured":
      return "Injured";
    case "not_active":
      return "Not Active";
    default:
      return "Active";
  }
};

exports.getPlayers = async (req, res) => {
  try {
    const coachSport = req.user.sport;

    // ⭐ FIXED → added year here
    let { page = 1, limit = 10, search = "", year = "", classGroup = "" } = req.query;

    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const filter = { role: "student", sport: coachSport };

    // Search by name
    if (search.trim() !== "") {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    // ⭐ FIXED: Year filter now works
    if (year !== "" && !isNaN(Number(year))) {
      filter.year = Number(year);
    }

    // Class filter
    if (classGroup.trim() !== "") {
      filter.classGroup = classGroup;
    }

    // Fetch players
    const [students, total] = await Promise.all([
      User.find(filter)
        .sort({ firstName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    // Format output
    const formatted = students.map((s) => ({
      _id: s._id,
      firstName: s.firstName,
      lastName: s.lastName,
      year: s.year,
      classGroup: s.classGroup,
      sport: s.sport,

      category: s.category || "",
      position: s.position || "",
      badmintonCategory: s.badmintonCategory || "",

      status: formatStatus(s.status),
    }));

    return res.json({
      students: formatted,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });

  } catch (err) {
    console.error("getPlayers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log("Updating Player ID:", id);
    console.log("Update Payload:", updates);

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Player not found." });
    }

    return res.json({
      message: "Player updated successfully",
      player: updated,
    });

  } catch (err) {
    console.error("UPDATE PLAYER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
