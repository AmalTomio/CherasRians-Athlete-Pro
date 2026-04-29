// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/mongo");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const excoRoutes = require("./routes/excoRoutes");
const coachRoutes = require("./routes/coachRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const medicalLeaveRoutes = require("./routes/medicalLeaveRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const studentRoutes = require("./routes/studentRoutes");
const disciplinaryRoutes = require("./routes/disciplinaryRoutes");

const { startWeeklyResetJobs } = require("./jobs/scheduler");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

const app = express();


app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());



const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


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


io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.user._id);

  socket.join(`user_${socket.user._id}`);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.user._id);
  });
});

app.set("io", io);
global.io = io;


(async () => {
  try {
    await connectDB();
    startWeeklyResetJobs();
  } catch (err) {
    console.error("❌ Failed to connect DB:", err.message);
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
app.use("/api/attendance", attendanceRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/team-lineup", require("./routes/teamLineupRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/equipment-borrow", require("./routes/equipmentBorrowRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/performance", require("./routes/performanceRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/disciplinary", disciplinaryRoutes);


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});