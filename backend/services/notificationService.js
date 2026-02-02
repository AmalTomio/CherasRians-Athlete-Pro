// backend/services/notificationService.js
const Notification = require("../models/Notification");

exports.sendNotification = async ({
  io,
  toUser,
  title,
  message,
  meta = {},
}) => {
  try {
    const notification = await Notification.create({
      toUser,
      title,
      message,
      meta,
    });

    if (io) {
      io.to(`user_${toUser}`).emit("new_notification", {
        _id: notification._id,
        title,
        message,
        meta,
        createdAt: notification.createdAt,
        read: false,
      });
    }

    return notification;
  } catch (err) {
    console.error("Notification Service Error:", err);
  }
};
