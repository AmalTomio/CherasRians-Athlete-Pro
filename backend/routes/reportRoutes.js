const router = require("express").Router();
const ctrl = require("../controllers/reportController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/attendance", verifyToken, ctrl.exportAttendance);
router.get("/matches", verifyToken, ctrl.exportMatches);
router.get("/disciplinary", verifyToken, ctrl.exportDisciplinary);

module.exports = router;