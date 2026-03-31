const Match = require("../models/Match");
const MatchPlayerStats = require("../models/MatchPlayerStats");

exports.createMatch = async (req, res) => {
  try {
    const coachId = req.user._id;
    const { opponent, venue, matchDate, category, lineupId } = req.body;

    const match = await Match.create({
      coachId,
      sport: req.user.sport,
      opponent,
      venue,
      matchDate,
      category,
      lineupId,
    });

    res.json({ match });
  } catch (err) {
    console.error("Create Match Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= SAVE RESULT ================= */
exports.saveResult = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { ourScore, opponentScore } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.score = { our: ourScore, opponent: opponentScore };

    if (ourScore > opponentScore) match.result = "win";
    else if (ourScore < opponentScore) match.result = "loss";
    else match.result = "draw";

    match.status = "completed";

    await match.save();

    req.app.get("io").emit("dashboard_update");

    res.json({ match });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving result" });
  }
};

exports.savePlayerStats = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { stats } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const ops = stats.map((p) => ({
      updateOne: {
        filter: { matchId, playerId: p.playerId },
        update: {
          $set: {
            matchId,
            playerId: p.playerId,
            sport: match.sport,
            category: match.category,
            isStarter: p.isStarter || false,
            minutesPlayed: p.minutesPlayed || 0,
            rating: p.rating || 0,
            stats: p.stats || {},
          },
        },
        upsert: true,
      },
    }));

    await MatchPlayerStats.bulkWrite(ops);

    req.app.get("io").emit("dashboard_update");

    res.json({ message: "Stats saved" });
  } catch (err) {
    console.error("Save Stats Error:", err);
    res.status(500).json({ message: "Error saving stats" });
  }
};