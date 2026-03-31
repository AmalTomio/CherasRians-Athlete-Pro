const router = require("express").Router();
const ctrl = require("../controllers/matchController");

router.post("/", ctrl.createMatch);
router.post("/result/:matchId", ctrl.saveResult);
router.post("/stats/:matchId", ctrl.savePlayerStats);

module.exports = router;