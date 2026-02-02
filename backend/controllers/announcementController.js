const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendNotification } = require("../services/notificationService");

exports.createAnnouncement = async (req, res) => {
  try {
    const user = req.user;

    const {
      title,
      message,
      targetRoles = [],
      targetSports = [],
      targetCategories = [],
      expiryDate,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message required" });
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: user._id,
      targetRoles,
      targetSports,
      targetCategories,
      expiryDate,
    });

    /* =============================
       FIND TARGET USERS
    ============================= */

    const filter = {};

    if (targetRoles.length > 0) {
      filter.role = { $in: targetRoles };
    }

    if (targetSports.length > 0) {
      filter.sport = { $in: targetSports };
    }

    if (targetCategories.length > 0) {
      filter.category = { $in: targetCategories };
    }

    const users = await User.find(filter).select("_id").lean();

    /* =============================
       CREATE NOTIFICATIONS
    ============================= */

    const notifications = users.map((u) => ({
      toUser: u._id,
      title: announcement.title,
      message: announcement.message,
      meta: { announcementId: announcement._id },
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    /* =============================
       EMIT REAL-TIME
    ============================= */

    createdNotifications.forEach((n) => {
      sendNotification(n.toUser.toString(), n);
    });

    res.status(201).json({
      message: "Announcement created",
      announcement,
      notifiedUsers: users.length,
    });
  } catch (err) {
    console.error("CREATE ANNOUNCEMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const now = new Date();

    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ announcements });
  } catch (err) {
    console.error("GET ANNOUNCEMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
