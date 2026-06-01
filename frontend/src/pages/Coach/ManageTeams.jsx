import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api/axios";
import { SPORT_META } from "../../config/sportMeta";
import FiltersCard from "../../components/FiltersCard";
import { successAlert, errorAlert } from "../../utils/swal";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiSave,
  FiUsers,
  FiShield,
  FiFilter,
  FiMinusCircle,
  FiArrowRight,
} from "react-icons/fi";

const SQUAD_RULES = {
  football: {
    starters: 11,
    subs: 9,
    starterLabel: "Starting",
    subLabel: "Substitutes",
  },
  sepak_takraw: {
    starters: 3,
    subs: 2,
    starterLabel: "Starting Regu",
    subLabel: "Reserves",
  },
  volleyball: {
    starters: 6,
    subs: 6,
    starterLabel: "Starting Six",
    subLabel: "Bench",
  },
  netball: {
    starters: 7,
    subs: 5,
    starterLabel: "Starting Seven",
    subLabel: "Reserves",
  },
  badminton: {
    starters: 8,
    subs: 4,
    starterLabel: "Main Roster",
    subLabel: "Reserves",
  },
};

export default function ManageTeams() {
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const sport = user?.sport || "football";

  const sportConfig = SQUAD_RULES[sport] || {
    starters: 11,
    subs: 7,
    starterLabel: "Starting Lineup",
    subLabel: "Bench",
  };
  const availableCategories = SPORT_META[sport]?.categories || ["U-15", "U-18"];

  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [category, setCategory] = useState(availableCategories[0]);

  const [players, setPlayers] = useState([]);
  const [starters, setStarters] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPlayers = useCallback(async () => {
    try {
      const res = await api.get("/coach/players/all");

      let filteredPlayers = res.data.students || [];

      if (search.trim()) {
        const keyword = search.toLowerCase();

        filteredPlayers = filteredPlayers.filter((p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(keyword),
        );
      }

      if (year) {
        filteredPlayers = filteredPlayers.filter(
          (p) => String(p.year) === String(year),
        );
      }

      if (classGroup) {
        filteredPlayers = filteredPlayers.filter(
          (p) => p.classGroup === classGroup,
        );
      }

      setPlayers(filteredPlayers);
    } catch (err) {
      console.error(err);
      errorAlert("Failed to load players");
    }
  }, [search, year, classGroup]);

  const fetchLineup = useCallback(async () => {
    try {
      const res = await api.get("/team-lineup", {
        params: { sport, category },
      });

      if (res.data.lineup) {
        setStarters(res.data.lineup.starters || []);
        setSubs(res.data.lineup.substitutes || []);
      } else {
        setStarters([]);
        setSubs([]);
      }
    } catch {
      setStarters([]);
      setSubs([]);
    }
  }, [sport, category]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  useEffect(() => {
    fetchLineup();
  }, [fetchLineup]);

  const getPlayerId = (item) => item?.playerId?._id;

  const availablePlayers = players.filter(
    (p) =>
      p.category === category &&
      p.status === "Active" &&
      !starters.some((s) => getPlayerId(s) === p._id) &&
      !subs.some((s) => getPlayerId(s) === p._id),
  );

  const addStarter = (player) => {
    if (starters.length >= sportConfig.starters) {
      return errorAlert(
        `${sportConfig.starterLabel} is full (${sportConfig.starters} max)`,
      );
    }
    setStarters([...starters, { playerId: player, position: player.position }]);
  };

  const addSub = (player) => {
    if (subs.length >= sportConfig.subs) {
      return errorAlert(
        `${sportConfig.subLabel} is full (${sportConfig.subs} max)`,
      );
    }
    setSubs([...subs, { playerId: player, position: player.position }]);
  };

  const removeFromLineup = (playerId) => {
    setStarters(starters.filter((s) => s.playerId._id !== playerId));
    setSubs(subs.filter((s) => s.playerId._id !== playerId));
  };

  /* =========================
     SAVE LINEUP
     ========================= */
  const saveLineup = async () => {
    setLoading(true);
    try {
      await api.post("/team-lineup", {
        sport,
        category,
        starters: starters.map((s) => ({
          playerId: s.playerId._id,
          position: s.position,
        })),
        substitutes: subs.map((s) => ({
          playerId: s.playerId._id,
          position: s.position,
        })),
      });
      successAlert("Squad lineup saved successfully!");
    } catch {
      errorAlert("Failed to save lineup");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch("");
    setYear("");
    setClassGroup("");
  };

  return (
    <div className="px-4 py-4">
      {/* 1. HEADER & CATEGORY TABS */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-end mb-4 gap-3">
        <div>
          <h2
            className="fw-bold mb-2 text-dark text-capitalize"
            style={{ letterSpacing: "-0.5px" }}
          >
            {sport.replace("_", " ")} Squad
          </h2>
          {/* Prominent Category Tabs */}
          <div className="d-flex gap-2">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
                  category === cat
                    ? "bg-dark text-white shadow-sm"
                    : "bg-white text-secondary border hover-bg-light"
                }`}
              >
                {cat} Team
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn text-white shadow-sm d-flex align-items-center gap-2 px-4 py-3"
          onClick={saveLineup}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
            border: "none",
            borderRadius: "12px",
            fontWeight: "600",
            transition: "all 0.2s",
          }}
        >
          <FiSave size={20} />
          {loading ? "Saving..." : "Save Matchday Squad"}
        </button>
      </div>

      {/* 2. FILTERS */}
      <FiltersCard
        search={search}
        setSearch={setSearch}
        year={year}
        setYear={setYear}
        classGroup={classGroup}
        setClassGroup={setClassGroup}
        showSport={false}
        onReset={handleReset}
        searchPlaceholder="Search available players..."
      />

      {/* 3. MAIN GRID */}
      <div className="row g-4 align-items-start">
        {/* === LEFT: AVAILABLE PLAYERS === */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
                <FiUsers className="text-primary" /> Available Roster
              </h5>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2">
                {availablePlayers.length} Players
              </span>
            </div>

            <div
              className="card-body p-3 bg-light rounded-bottom-4"
              style={{ maxHeight: "700px", overflowY: "auto" }}
            >
              {availablePlayers.length === 0 ? (
                <div className="text-center py-5 text-muted d-flex flex-column align-items-center">
                  <FiFilter size={40} className="mb-3 opacity-25" />
                  <h6 className="fw-bold text-dark">No players available</h6>
                  <p className="small m-0">
                    Try adjusting your filters or check team assignments.
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  <AnimatePresence>
                    {availablePlayers.map((p) => (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: 0.95,
                          height: 0,
                          marginBottom: 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="card border-0 shadow-sm rounded-3">
                          <div className="card-body p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                            {/* Player Info */}
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-secondary bg-secondary-subtle shrink-0"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  fontSize: "16px",
                                }}
                              >
                                {p.firstName?.charAt(0)}
                              </div>
                              <div>
                                <div className="fw-bold text-dark lh-sm">
                                  {p.firstName} {p.lastName}
                                </div>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                  <span
                                    className="badge bg-light text-secondary border fw-medium text-truncate"
                                    style={{
                                      fontSize: "0.7rem",
                                      maxWidth: "120px",
                                    }}
                                  >
                                    {p.position || "Unassigned"}
                                  </span>
                                  <span
                                    className="text-muted"
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    {p.classGroup}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary fw-bold d-flex align-items-center gap-1"
                                onClick={() => addStarter(p)}
                                disabled={
                                  starters.length >= sportConfig.starters
                                }
                                title={
                                  starters.length >= sportConfig.starters
                                    ? `${sportConfig.starterLabel} is full`
                                    : `Add to ${sportConfig.starterLabel}`
                                }
                              >
                                Start <FiArrowRight />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-info fw-bold d-flex align-items-center gap-1"
                                onClick={() => addSub(p)}
                                disabled={subs.length >= sportConfig.subs}
                                title={
                                  subs.length >= sportConfig.subs
                                    ? `${sportConfig.subLabel} is full`
                                    : `Add to ${sportConfig.subLabel}`
                                }
                              >
                                Bench <FiArrowRight />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === RIGHT: MATCHDAY SQUAD SHEET === */}
        <div className="col-lg-6" style={{ position: "sticky", top: "20px" }}>
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div
              className="card-header text-white p-4 border-0 d-flex justify-content-between align-items-center"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
              }}
            >
              <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                <FiShield /> Matchday Squad
              </h5>
              <span className="badge bg-white text-primary shadow-sm rounded-pill px-3 py-2">
                {starters.length + subs.length} /{" "}
                {sportConfig.starters + sportConfig.subs}
              </span>
            </div>

            <div className="card-body p-0">
              {/* STARTERS SECTION */}
              <div className="bg-primary-subtle px-4 py-2 d-flex justify-content-between align-items-center border-bottom border-primary-subtle">
                <span className="fw-bold text-primary small text-uppercase">
                  {sportConfig.starterLabel}
                </span>
                <span
                  className={`badge ${starters.length === sportConfig.starters ? "bg-success" : "bg-primary"} rounded-pill`}
                >
                  {starters.length} / {sportConfig.starters}
                </span>
              </div>

              <ul className="list-group list-group-flush">
                <AnimatePresence>
                  {starters.length === 0 && (
                    <li className="list-group-item text-center text-muted py-4 small bg-light">
                      No starters selected
                    </li>
                  )}
                  {starters.map((item) => (
                    <LineupItem
                      key={item.playerId._id}
                      item={item}
                      onRemove={removeFromLineup}
                      type="starter"
                    />
                  ))}
                </AnimatePresence>
              </ul>

              {/* SUBSTITUTES SECTION */}
              <div className="bg-info-subtle px-4 py-2 d-flex justify-content-between align-items-center border-bottom border-info-subtle border-top">
                <span className="fw-bold text-info small text-uppercase d-flex align-items-center gap-1">
                  {sportConfig.subLabel}
                </span>
                <span
                  className={`badge ${subs.length === sportConfig.subs ? "bg-success" : "bg-info"} rounded-pill`}
                >
                  {subs.length} / {sportConfig.subs}
                </span>
              </div>

              <ul className="list-group list-group-flush mb-3">
                <AnimatePresence>
                  {subs.length === 0 && (
                    <li className="list-group-item text-center text-muted py-4 small bg-light">
                      No substitutes selected
                    </li>
                  )}
                  {subs.map((item) => (
                    <LineupItem
                      key={item.playerId._id}
                      item={item}
                      onRemove={removeFromLineup}
                      type="sub"
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   REUSABLE SQUAD ITEM
   ========================= */
function LineupItem({ item, onRemove, type }) {
  const p = item.playerId || {};
  const isStarter = type === "starter";

  return (
    <motion.li
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center hover-bg-light"
    >
      <div className="d-flex align-items-center gap-3 w-100 pe-3">
        <div className="fw-bold text-dark text-truncate" style={{ flex: 1 }}>
          {p.firstName} {p.lastName}
        </div>
        <div
          className={`badge border fw-medium ${isStarter ? "bg-primary-subtle text-primary border-primary-subtle" : "bg-info-subtle text-info border-info-subtle"}`}
          style={{ maxWidth: "120px" }}
        >
          <span className="text-truncate d-block">
            {item.position || "Unassigned"}
          </span>
        </div>
      </div>

      <button
        className="btn btn-sm text-danger p-1 hover-danger transition-all flex-shrink-0"
        onClick={() => onRemove(p._id)}
        title="Remove from squad"
      >
        <FiMinusCircle size={18} />
      </button>
    </motion.li>
  );
}
