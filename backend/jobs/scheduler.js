// backend/jobs/scheduler.js
const cron = require("node-cron");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/User");
const moment = require("moment-timezone");

// Always use Malaysia timezone
const TZ = "Asia/Kuala_Lumpur";

function startWeeklyResetJobs() {

  // -----------------------------
  // WEEKLY RESET — Every Sunday 8:00 PM MYT
  // -----------------------------
  cron.schedule("0 20 * * 0", async () => {
    try {
      console.log("[Scheduler] Running weekly reset job...");

      // Reset all bookings
      await Booking.updateMany({}, { status: "cancelled" });

      // Notify all coaches
      const coaches = await User.find({ role: "coach" });
      await Promise.all(
        coaches.map((c) =>
          Notification.create({
            toUser: c._id,
            title: "Weekly Schedule Reset",
            message:
              "All facility bookings have been reset. Please rebook your facilities.",
          })
        )
      );

      console.log("[Scheduler] Weekly reset completed.");
    } catch (err) {
      console.error("[Scheduler] Weekly reset error:", err);
    }
  }, { timezone: TZ });

  // -----------------------------
  // DAILY REMINDER — Every day at 8:00 AM MYT
  // -----------------------------
  cron.schedule("0 8 * * *", async () => {
    try {
      const today = moment().tz(TZ).startOf("day");

      // Next Sunday
      let nextSunday = moment().tz(TZ).day(7).startOf("day");

      if (nextSunday.isSameOrBefore(today)) {
        nextSunday = nextSunday.add(7, "days");
      }

      const daysLeft = nextSunday.diff(today, "days");

      // Send reminder exactly 2 days before reset
      if (daysLeft === 2) {
        const coaches = await User.find({ role: "coach" });

        await Promise.all(
          coaches.map((c) =>
            Notification.create({
              toUser: c._id,
              title: "Reminder: Schedule Reset Soon",
              message: `Schedules will reset on ${nextSunday
                .format("YYYY-MM-DD")
                .toString()}. Please ensure your bookings are updated.`,
            })
          )
        );

        console.log("[Scheduler] 2-day reset reminders sent.");
      }
    } catch (err) {
      console.error("[Scheduler] Reminder job error:", err);
    }
  }, { timezone: TZ });

  console.log("Scheduler jobs started (Timezone: Asia/Kuala_Lumpur)");
}

module.exports = { startWeeklyResetJobs };
