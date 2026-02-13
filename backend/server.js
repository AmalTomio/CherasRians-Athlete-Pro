// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/mongo");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/auth");
const excoRoutes = require("./routes/excoRoutes");
const coachRoutes = require("./routes/coachRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const medicalLeaveRoutes = require("./routes/medicalLeaveRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const studentRoutes = require("./routes/studentRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

const { startWeeklyResetJobs } = require("./jobs/scheduler");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

const app = express();
app.use(cors());
app.use(express.json());

/* ================= CREATE HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET.IO SETUP ================= */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite frontend
    methods: ["GET", "POST"],
  },
});

/* ================= SOCKET AUTH ================= */
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized - No token"));
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    socket.user = {
      _id: decoded._id || decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return next(new Error("Unauthorized - Invalid token"));
  }
});

/* ================= SOCKET CONNECTION ================= */
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.user._id);

  // Each user joins their own private room
  socket.join(`user_${socket.user._id}`);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.user._id);
  });
});

/* ================= MAKE IO AVAILABLE GLOBALLY ================= */
app.set("io", io);

/* ================= DATABASE INIT ================= */
(async () => {
  try {
    await connectDB();
    startWeeklyResetJobs();
  } catch (err) {
    console.error("Failed to connect DB:", err);
    process.exit(1);
  }
})();

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/exco", excoRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/api/medical", medicalLeaveRoutes);
app.use("/api/leave", medicalLeaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/team-lineup", require("./routes/teamLineupRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Backend running with Socket.IO on port ${PORT}`)
);
