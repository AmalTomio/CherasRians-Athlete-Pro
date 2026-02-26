const EquipmentBorrow = require("../models/EquipmentBorrow");
const User = require("../models/User");
const { sendNotification } = require("../services/notificationService");

exports.runEquipmentOverdueCheck = async (io) => {
  try {
    const now = new Date();

    const overdueBorrows = await EquipmentBorrow.find({
      status: "borrowed",
      dueAt: { $lt: now }
    }).lean();

    if (!overdueBorrows.length) return;

    for (const borrow of overdueBorrows) {

      await EquipmentBorrow.findByIdAndUpdate(borrow._id, {
        status: "overdue"
      });

      const excos = await User.find({ role: "exco" }).select("_id");

      for (const ex of excos) {
        await sendNotification({
          io,
          toUser: ex._id,
          title: "Overdue Equipment Return",
          message: `${borrow.equipmentName} has not been returned by coach.`,
          meta: { borrowId: borrow._id }
        });
      }
    }

    console.log("Equipment overdue check completed");

  } catch (err) {
    console.error("Equipment Overdue Job Error:", err);
  }
};