// backend/services/notificationService.js
const Notification = require("../models/Notification");

/**
 * Send notification to a specific user
 * @param {Object} params
 * @param {Object} params.io - socket.io instance
 * @param {String} params.toUser - User ObjectId
 * @param {String} params.title - Notification title
 * @param {String} params.message - Notification message
 * @param {Object} params.meta - Optional metadata
 */
exports.sendNotification = async ({
  io,
  toUser,
  title,
  message,
  meta = {},
}) => {
  try {
    // 1️⃣ Save to database
    const notification = await Notification.create({
      toUser,
      title,
      message,
      meta,
    });

    // 2️⃣ Emit real-time event to that specific user room
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
