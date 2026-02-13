const Announcement = require("../models/Announcement");
const User = require("../models/User");
const { sendNotification } = require("../services/notificationService");

exports.createAnnouncement = async (req, res) => {
  try {
    const sender = req.user;

    const {
      title,
      content,
      targetUsers = [],
      targetRoles = [],
      targetSports = [],
      targetCategories = [],
      expiryDate,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content required" });
    }

    /* ===============================
       PERMISSION VALIDATION
    =============================== */

    // Coach cannot send to Exco
    if (
      sender.role === "coach" &&
      targetRoles.includes("exco")
    ) {
      return res
        .status(403)
        .json({ message: "Coach cannot send announcement to Exco." });
    }

    /* ===============================
       PREVENT EMPTY TARGETING
       (No broadcast by default)
    =============================== */

    const hasDirectUsers = targetUsers && targetUsers.length > 0;
    const hasFilters =
      targetRoles.length > 0 ||
      targetSports.length > 0 ||
      targetCategories.length > 0;

    if (!hasDirectUsers && !hasFilters) {
      return res.status(400).json({
        message:
          "You must select at least one recipient (direct users or filters).",
      });
    }

    /* ===============================
       CREATE ANNOUNCEMENT RECORD
    =============================== */

    const announcement = await Announcement.create({
      title,
      content,
      createdBy: sender._id,
      targetUsers,
      targetRoles,
      targetSports,
      targetCategories,
      expiryDate,
      isActive: true,
    });

    /* ===============================
       RESOLVE TARGET USERS
    =============================== */

    let users = [];

    // 1️⃣ DIRECT TARGET (OVERRIDES FILTERS)
    if (hasDirectUsers) {
      users = await User.find({
        _id: { $in: targetUsers },
        role: { $in: ["student", "coach"] },
      })
        .select("_id firstName lastName")
        .lean();
    }

    // 2️⃣ FILTER TARGET
    else {
      const filter = {
        role: { $in: ["student", "coach"] },
      };

      if (targetRoles.length > 0) {
        filter.role = { $in: targetRoles };
      }

      if (targetSports.length > 0) {
        filter.sport = { $in: targetSports };
      }

      if (targetCategories.length > 0) {
        filter.category = { $in: targetCategories };
      }

      users = await User.find(filter)
        .select("_id firstName lastName")
        .lean();
    }

    // Remove duplicates (safety)
    const uniqueUsers = [
      ...new Map(users.map((u) => [u._id.toString(), u])).values(),
    ];

    /* ===============================
       SEND NOTIFICATIONS
    =============================== */

    const io = req.app.get("io");

    for (const u of uniqueUsers) {
      await sendNotification({
        io,
        toUser: u._id,
        title: announcement.title,
        message: announcement.content,
        meta: {
          announcementId: announcement._id,
          createdBy: sender._id,
          senderName: `${sender.firstName} ${sender.lastName}`,
        },
      });
    }

    return res.status(201).json({
      message: "Announcement created",
      announcement,
      notifiedUsers: uniqueUsers.length,
    });
  } catch (err) {
    console.error("CREATE ANNOUNCEMENT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.getAnnouncements = async (req, res) => {
  try {
    const now = new Date();

    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
    })
      .populate("createdBy", "firstName lastName role")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ announcements });
  } catch (err) {
    console.error("GET ANNOUNCEMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
