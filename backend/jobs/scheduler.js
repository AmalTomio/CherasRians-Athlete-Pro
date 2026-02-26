const cron = require("node-cron");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Equipment = require("../models/Equipment");
const moment = require("moment-timezone");
const { runEquipmentOverdueCheck } = require("./equipmentOverdueJob");

const TZ = "Asia/Kuala_Lumpur";

function startWeeklyResetJobs() {

  /* =====================================================
     WEEKLY RESET — Every Sunday 8PM MYT
  ====================================================== */
  cron.schedule(
    "0 20 * * 0",
    async () => {
      try {
        console.log("[Scheduler] Running weekly reset job...");

        const today = moment().tz(TZ).startOf("day").toDate();

        await Booking.updateMany(
          { startAt: { $gte: today } },
          { status: "cancelled" }
        );

        const coaches = await User.find({ role: "coach" }).lean();
        await Promise.all(
          coaches.map((c) =>
            Notification.create({
              toUser: c._id,
              title: "Weekly Schedule Reset",
              message:
                "All upcoming facility bookings have been reset. Please rebook your facilities.",
            })
          )
        );

        console.log("[Scheduler] Weekly reset completed.");
      } catch (err) {
        console.error("[Scheduler] Weekly reset error:", err);
      }
    },
    { timezone: TZ }
  );

  /* =====================================================
     DAILY REMINDER — 8AM MYT
  ====================================================== */
  cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        const today = moment().tz(TZ).startOf("day");

        let nextSunday = moment().tz(TZ).day(7).startOf("day");
        if (nextSunday.isSameOrBefore(today)) {
          nextSunday = nextSunday.add(7, "days");
        }

        const daysLeft = nextSunday.diff(today, "days");

        if (daysLeft === 2) {
          const coaches = await User.find({ role: "coach" }).lean();

          await Promise.all(
            coaches.map((c) =>
              Notification.create({
                toUser: c._id,
                title: "Reminder: Schedule Reset Soon",
                message: `Schedules will reset on ${nextSunday.format(
                  "YYYY-MM-DD"
                )}. Please ensure your bookings are updated.`,
              })
            )
          );

          console.log("[Scheduler] 2-day reset reminders sent.");
        }
      } catch (err) {
        console.error("[Scheduler] Reminder job error:", err);
      }
    },
    { timezone: TZ }
  );

  /* =====================================================
     AUTO RELEASE EQUIPMENT — Every 10 minutes
  ====================================================== */
  cron.schedule(
    "*/10 * * * *",
    async () => {
      try {
        const now = moment().tz(TZ).toDate();

        const expiredBookings = await Booking.find({
          status: "approved",
          endAt: { $lte: now },
          equipmentReleased: false,
          equipmentRequests: { $exists: true, $ne: [] },
        }).lean();

        if (!expiredBookings.length) return;

        for (const booking of expiredBookings) {
          for (const req of booking.equipmentRequests) {
            if (!req.equipmentId || !req.quantity) continue;

            await Equipment.findByIdAndUpdate(req.equipmentId, {
              $inc: { quantityAvailable: req.quantity },
            });
          }

          await Booking.findByIdAndUpdate(booking._id, {
            equipmentReleased: true,
          });

          console.log(
            `[Scheduler] Equipment auto-released for booking ${booking._id}`
          );
        }
      } catch (err) {
        console.error("[Scheduler] Equipment release error:", err);
      }
    },
    { timezone: TZ }
  );

  /* =====================================================
     EQUIPMENT OVERDUE CHECK — Every hour
  ====================================================== */
  cron.schedule(
    "0 * * * *",
    async () => {
      try {
        console.log("[Scheduler] Running overdue check...");
        await runEquipmentOverdueCheck(global.io);
      } catch (err) {
        console.error("[Scheduler] Overdue check error:", err);
      }
    },
    { timezone: TZ }
  );

  console.log("Scheduler jobs started (Timezone: Asia/Kuala_Lumpur)");
}

module.exports = { startWeeklyResetJobs };