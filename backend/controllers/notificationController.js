const Notification = require("../models/Notification");


exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    let { page = 1, limit = 10 } = req.query;
    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const filter = { toUser: userId };

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Notification.countDocuments(filter),

      Notification.countDocuments({ ...filter, read: false }),
    ]);

    return res.json({
      notifications,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    });
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
