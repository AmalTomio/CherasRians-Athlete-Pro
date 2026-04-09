const router = require("express").Router();
const ctrl = require("../controllers/disciplinaryController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, ctrl.createCase);
router.put("/:id", verifyToken, ctrl.updateCase);

router.get("/coach", verifyToken, ctrl.getCoachCases);
router.get("/player", verifyToken, ctrl.getPlayerCases);
router.get("/all", verifyToken, ctrl.getAllCases);

module.exports = router;