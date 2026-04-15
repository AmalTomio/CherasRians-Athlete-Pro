const ExcelJS = require("exceljs");
const mongoose = require("mongoose");

const Attendance = require("../models/Attendance");
const Booking = require("../models/Booking");
const Match = require("../models/Match");
const DisciplinaryCase = require("../models/DisciplinaryRecord");

exports.exportAttendance = async (req, res) => {
  try {
    const coachId = req.user._id;
    const { bookingId, playerName } = req.query;

    const bookings = await Booking.find({ coachId }).select("_id");
    if (!bookings.length) {
      return res.status(404).json({ message: "No sessions found" });
    }

    let filter = {
      bookingId: { $in: bookings.map(b => b._id) },
    };

    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      filter.bookingId = new mongoose.Types.ObjectId(bookingId);
    }

    let records = await Attendance.find(filter)
      .populate("playerId", "firstName lastName")
      .populate("bookingId", "sessionTitle startAt")
      .lean();

    if (playerName?.trim()) {
      const keyword = playerName.toLowerCase();
      records = records.filter(r =>
        `${r.playerId?.firstName || ""} ${r.playerId?.lastName || ""}`
          .toLowerCase()
          .includes(keyword)
      );
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Attendance");

    sheet.columns = [
      { header: "No", key: "no", width: 8 },
      { header: "Player", key: "name", width: 25 },
      { header: "Session", key: "session", width: 30 },
      { header: "Date", key: "date", width: 20 },
      { header: "Status", key: "status", width: 15 },
    ];

    records.forEach((r, i) => {
      sheet.addRow({
        no: i + 1,
        name: `${r.playerId?.firstName || ""} ${r.playerId?.lastName || ""}`,
        session: r.bookingId?.sessionTitle || "-",
        date: r.bookingId?.startAt
          ? new Date(r.bookingId.startAt).toLocaleDateString()
          : "-",
        status: r.status,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=attendance.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Attendance Export Error:", err);
    res.status(500).json({ message: "Export error" });
  }
};

exports.exportMatches = async (req, res) => {
  try {
    const coachId = req.user._id;

    const matches = await Match.find({ coachId })
      .sort({ matchDate: -1 })
      .lean();

    if (!matches.length) {
      return res.status(404).json({ message: "No matches found" });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Matches");

    sheet.columns = [
      { header: "No", key: "no", width: 8 },
      { header: "Date", key: "date", width: 20 },
      { header: "Opponent", key: "opponent", width: 25 },
      { header: "Category", key: "category", width: 15 },
      { header: "Score", key: "score", width: 15 },
      { header: "Result", key: "result", width: 15 },
    ];

    matches.forEach((m, i) => {
      sheet.addRow({
        no: i + 1,
        date: new Date(m.matchDate).toLocaleDateString(),
        opponent: m.opponent,
        category: m.category,
        score: m.score
          ? `${m.score.our} - ${m.score.opponent}`
          : "-",
        result: m.result || "-",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=matches.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Match Export Error:", err);
    res.status(500).json({ message: "Export error" });
  }
};

exports.exportDisciplinary = async (req, res) => {
  try {
    const { playerName, sport, category } = req.query;

    let filter = {};
    if (sport) filter.sport = sport;
    if (category) filter.category = category;

    let records = await DisciplinaryCase.find(filter)
      .populate("playerId", "firstName lastName")
      .lean();

    if (playerName?.trim()) {
      const keyword = playerName.toLowerCase();
      records = records.filter(r =>
        `${r.playerId?.firstName || ""} ${r.playerId?.lastName || ""}`
          .toLowerCase()
          .includes(keyword)
      );
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Disciplinary");

    sheet.columns = [
      { header: "No", key: "no", width: 8 },
      { header: "Player", key: "player", width: 25 },
      { header: "Sport", key: "sport", width: 15 },
      { header: "Category", key: "category", width: 10 },
      { header: "Type", key: "type", width: 10 },
      { header: "Reason", key: "reason", width: 20 },
      { header: "Severity", key: "severity", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Date", key: "date", width: 15 },
    ];

    records.forEach((r, i) => {
      sheet.addRow({
        no: i + 1,
        player: `${r.playerId?.firstName || ""} ${r.playerId?.lastName || ""}`,
        sport: r.sport,
        category: r.category,
        type: r.type,
        reason: r.reason,
        severity: r.severity,
        status: r.status,
        date: r.createdAt
          ? new Date(r.createdAt).toLocaleDateString()
          : "-",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=disciplinary.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Disciplinary Export Error:", err);
    res.status(500).json({ message: "Export error" });
  }
};