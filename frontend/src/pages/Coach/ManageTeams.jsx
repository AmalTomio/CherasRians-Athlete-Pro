import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { SPORT_META } from "../../config/sportMeta";
import FiltersCard from "../../components/FiltersCard";
import { successAlert, errorAlert } from "../../utils/swal";
import {
  FiUserPlus,
  FiUserCheck,
  FiTrash2,
  FiSave,
  FiUsers,
  FiShield,
  FiFilter
} from "react-icons/fi";

export default function ManageTeams() {
  const sport = "football";

  // FILTER STATE
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [category, setCategory] = useState("U-15");

  // DATA
  const [players, setPlayers] = useState([]);
  const [starters, setStarters] = useState([]);
  const [subs, setSubs] = useState([]);

  const MAX_STARTERS = 11;
  const MAX_SUBS = 7;

  /* =========================
     FETCH PLAYERS
     ========================= */
  const fetchPlayers = useCallback(async () => {
    try {
      const res = await api.get("/coach/players", {
        params: { search, year, classGroup },
      });
      setPlayers(res.data.students || []);
    } catch {
      errorAlert("Failed to load players");
    }
  }, [search, year, classGroup]);

  /* =========================
     FETCH LINEUP (DB SOURCE)
     ========================= */
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

  /* =========================
     HELPERS & LOGIC
     ========================= */
  const getPlayerId = (item) => item?.playerId?._id;

  const availablePlayers = players.filter(
    (p) =>
      p.category === category &&
      p.status === "Active" &&
      !starters.some((s) => getPlayerId(s) === p._id) &&
      !subs.some((s) => getPlayerId(s) === p._id)
  );

  /* =========================
     ADD / REMOVE
     ========================= */
  const addStarter = (player) => {
    if (starters.length >= MAX_STARTERS)
      return errorAlert("Starting XI is full");

    setStarters([
      ...starters,
      { playerId: player, position: player.position },
    ]);
  };

  const addSub = (player) => {
    if (subs.length >= MAX_SUBS)
      return errorAlert("Substitutes bench is full");

    setSubs([
      ...subs,
      { playerId: player, position: player.position },
    ]);
  };

  const removeFromLineup = async (playerId) => {
    const newStarters = starters.filter((s) => s.playerId._id !== playerId);
    const newSubs = subs.filter((s) => s.playerId._id !== playerId);

    setStarters(newStarters);
    setSubs(newSubs);

    try {
      await api.post("/team-lineup", {
        sport,
        category,
        starters: newStarters.map((s) => ({
          playerId: s.playerId._id,
          position: s.position,
        })),
        substitutes: newSubs.map((s) => ({
          playerId: s.playerId._id,
          position: s.position,
        })),
      });
    } catch {
      errorAlert("Failed to sync lineup");
    }
  };

  /* =========================
     SAVE LINEUP
     ========================= */
  const saveLineup = async () => {
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
      successAlert("Team lineup saved successfully");
    } catch {
      errorAlert("Failed to save lineup");
    }
  };

  const handleReset = () => {
    setSearch("");
    setYear("");
    setClassGroup("");
  };

  return (
    <div className="px-4 py-4">
      {/* 1. HEADER ROW */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark" style={{ letterSpacing: "-0.5px" }}>
            Manage Squad
          </h2>
          <p className="text-muted mb-0">Select your matchday squad for {category}</p>
        </div>
        
        <button
          className="btn text-white shadow-sm d-flex align-items-center gap-2 px-4 py-2"
          onClick={saveLineup}
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", // Indigo
            border: "none",
            borderRadius: "10px",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
        >
          <FiSave size={18} />
          Save Lineup
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
        searchPlaceholder="Find player..."
      />

      {/* 3. MAIN GRID */}
      <div className="row g-4 align-items-start">
        
        {/* === LEFT: AVAILABLE PLAYERS === */}
        <div className="col-lg-5">
          <div 
            className="card border-0 shadow-sm"
            style={{ borderRadius: "12px", overflow: "hidden" }}
          >
            {/* Header with Integrated Category Selector */}
            <div className="card-header bg-white border-bottom py-2 pe-2 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 ps-2">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: "32px", height: "32px", background: "#6366f1" }}
                >
                  <FiUsers size={16} />
                </div>
                <h6 className="m-0 fw-bold text-dark">Available</h6>
                <span className="badge bg-light text-secondary border">{availablePlayers.length}</span>
              </div>

              {/* Selector */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small fw-bold text-uppercase d-none d-md-block" style={{ fontSize: "0.7rem" }}>
                   Cat:
                </span>
                <select
                  className="form-select form-select-sm border-0 bg-light  fw-bold"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: "auto", cursor: "pointer" }}
                >
                  {SPORT_META[sport].categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            <div className="card-body p-3 bg-light" style={{ maxHeight: "650px", overflowY: "auto" }}>
              {availablePlayers.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FiFilter size={32} className="mb-2 opacity-25" /><br/>
                  No players found for {category}
                </div>
              ) : (
                availablePlayers.map((p) => (
                  <PlayerCard
                    key={p._id}
                    player={p}
                    onStarter={addStarter}
                    onSub={addSub}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* === RIGHT: LINEUP (Sticky) === */}
        <div className="col-lg-7" style={{ position: "sticky", top: "20px" }}>
          <div className="d-flex flex-column gap-4">
            
            {/* STARTERS (Indigo) */}
            <LineupSection
              title="Starting XI"
              max={MAX_STARTERS}
              theme="indigo"
              icon={<FiShield />}
              players={starters}
              onRemove={removeFromLineup}
            />

            {/* SUBS (Sea Blue) */}
            <LineupSection
              title="Substitutes"
              max={MAX_SUBS}
              theme="seaBlue"
              icon={<FiUserCheck />}
              players={subs}
              onRemove={removeFromLineup}
            />

          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   UI COMPONENTS
   ========================= */

function PlayerCard({ player, onStarter, onSub }) {
  return (
    <div 
      className="card border-0 mb-2 shadow-sm"
      style={{ borderRadius: "8px", transition: "transform 0.2s" }}
    >
      <div className="card-body p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
           <div 
             className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
             style={{ width: "36px", height: "36px", fontSize: "14px", background: "#cbd5e1" }}
           >
             {player.firstName?.charAt(0)}
           </div>
           <div>
             <div className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>
               {player.firstName} {player.lastName}
             </div>
             <div className="d-flex align-items-center gap-2 mt-1">
                <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: "0.65rem" }}>
                  {player.position || "N/A"}
                </span>
                <span className="small text-muted" style={{ fontSize: "0.7rem" }}>
                  {player.classGroup}
                </span>
             </div>
           </div>
        </div>
        
        <div className="d-flex flex-column gap-1">
          <button
            className="btn btn-sm text-white fw-bold d-flex align-items-center justify-content-center gap-1"
            onClick={() => onStarter(player)}
            style={{ 
              background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
              borderRadius: "4px", fontSize: "0.7rem", border: "none", width: "60px"
            }}
          >
            XI
          </button>
          <button
            className="btn btn-sm text-white fw-bold d-flex align-items-center justify-content-center gap-1"
            onClick={() => onSub(player)}
            style={{ 
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              borderRadius: "4px", fontSize: "0.7rem", border: "none", width: "60px"
            }}
          >
            SUB
          </button>
        </div>
      </div>
    </div>
  );
}

function LineupSection({ title, max, theme, icon, players, onRemove }) {
  // Theme configuration
  const THEMES = {
    indigo: { headerBg: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)" },
    seaBlue: { headerBg: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" }
  };
  const currentTheme = THEMES[theme];

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
      {/* Header */}
      <div 
        className="card-header text-white py-2 px-3 d-flex justify-content-between align-items-center"
        style={{ background: currentTheme.headerBg }}
      >
        <div className="d-flex align-items-center gap-2 fw-bold" style={{ fontSize: "0.9rem" }}>
          {icon} {title}
        </div>
        <span 
          className="badge rounded-pill" 
          style={{ background: "rgba(255,255,255,0.25)", fontSize: "0.75rem", fontWeight: "600", minWidth: "40px" }}
        >
          {players.length}/{max}
        </span>
      </div>

      {/* Body */}
      <div className="card-body bg-light p-2">
        {players.length === 0 ? (
          <div className="text-center py-4 border rounded bg-white border-dashed text-muted small">
            No players selected
          </div>
        ) : (
          <div className="row g-2">
            {players.map((item) => {
              // Logic Check: 'item' is { playerId: {...}, position: ... }
              const p = item.playerId || {}; 
              return (
                <div key={p._id} className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded shadow-sm border h-100">
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                       <div className="fw-bold text-dark text-truncate" style={{ fontSize: "0.85rem" }}>
                         {p.firstName} {p.lastName}
                       </div>
                    </div>
                    <button
                      className="btn btn-sm text-danger p-0 px-2"
                      onClick={() => onRemove(p._id)}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}