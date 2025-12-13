// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/mongo");

const authRoutes = require("./routes/auth");
const excoRoutes = require("./routes/excoRoutes");
const coachRoutes = require("./routes/coachRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const medicalLeaveRoutes = require("./routes/medicalLeaveRoutes");

// scheduler
const { startWeeklyResetJobs } = require("./jobs/scheduler");

const app = express();
app.use(cors());
app.use(express.json());

(async () => {
  try {
    await connectDB(); // ensure DB connected
    console.log("MongoDB connected — starting scheduler");
    startWeeklyResetJobs(); // start cron jobs after DB is up
  } catch (err) {
    console.error("Failed to connect DB:", err);
    process.exit(1);
  }
})();

app.use("/api/auth", authRoutes);
app.use("/api/exco", excoRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/api/medical", medicalLeaveRoutes);
app.use("/api/leave", medicalLeaveRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
