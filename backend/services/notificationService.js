// backend/services/notificationService.js
const Notification = require("../models/Notification");

exports.sendNotification = async ({
  io,
  toUser,
  title,
  message,
  createdBy,
  createdByName,
  meta = {},
}) => {
  try {
    const notification = await Notification.create({
      toUser,
      title,
      message,
      createdBy,
      createdByName,
      meta,
    });

    if (io) {
      io.to(`user_${toUser}`).emit("new_notification", notification);
    }

    return notification;
  } catch (err) {
    console.error("Notification Service Error:", err);
  }
};
