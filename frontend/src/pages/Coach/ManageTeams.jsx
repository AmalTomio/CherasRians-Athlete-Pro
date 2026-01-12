import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { SPORT_META } from "../../config/sportMeta";
import FiltersCard from "../../components/FiltersCard";
import { successAlert, errorAlert } from "../../utils/swal";

export default function ManageTeams() {
  const sport = "football"; // later derive from auth

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
     FETCH PLAYERS (FILTERED)
     ========================= */
  const fetchPlayers = useCallback(async () => {
    try {
      const res = await api.get("/coach/players", {
        params: {
          search,
          year,
          classGroup,
        },
      });

      setPlayers(res.data.students || []);
    } catch {
      errorAlert("Failed to load players");
    }
  }, [search, year, classGroup]);

  /* =========================
     FETCH SAVED LINEUP
     ========================= */
  const fetchLineup = useCallback(async () => {
    try {
      const res = await api.get("/team-lineup", {
        params: { sport, category },
      });

      if (res.data.lineup) {
        setStarters(res.data.lineup.starters.map(s => s.playerId));
        setSubs(res.data.lineup.substitutes.map(s => s.playerId));
      } else {
        setStarters([]);
        setSubs([]);
      }
    } catch {
      // silent – no lineup yet
    }
  }, [category]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  useEffect(() => {
    fetchLineup();
  }, [fetchLineup]);

  /* =========================
     FILTERED PLAYER POOL
     ========================= */
  const availablePlayers = players.filter(
    p =>
      p.category === category &&
      p.status === "Active" &&
      !starters.some(s => s._id === p._id) &&
      !subs.some(s => s._id === p._id)
  );

  /* =========================
     LINEUP ACTIONS
     ========================= */
  const addStarter = (p) => {
    if (starters.length >= MAX_STARTERS) return;
    setStarters([...starters, p]);
  };

  const addSub = (p) => {
    if (subs.length >= MAX_SUBS) return;
    setSubs([...subs, p]);
  };

  const removeFromLineup = (id) => {
    setStarters(starters.filter(p => p._id !== id));
    setSubs(subs.filter(p => p._id !== id));
  };

  /* =========================
     SAVE LINEUP
     ========================= */
  const saveLineup = async () => {
    try {
      await api.post("/team-lineup", {
        sport,
        category,
        starters: starters.map(p => ({
          playerId: p._id,
          position: p.position,
        })),
        substitutes: subs.map(p => ({
          playerId: p._id,
          position: p.position,
        })),
      });

      successAlert("Team lineup saved");
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
    <div className="px-3 py-4">
      <h2 className="fw-bold mb-1">Manage Team Lineup</h2>
      <p className="text-muted mb-3">
        Select players and prepare matchday squad
      </p>

      {/* FILTERS */}
      <FiltersCard
        search={search}
        setSearch={setSearch}
        year={year}
        setYear={setYear}
        classGroup={classGroup}
        setClassGroup={setClassGroup}
        showSport={false}
        onReset={handleReset}
      />

      {/* CATEGORY */}
      <div className="mb-4">
        <label className="form-label fw-bold">Category</label>
        <select
          className="form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {SPORT_META[sport].categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="row g-3">
        {/* AVAILABLE PLAYERS */}
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header fw-bold">Available Players</div>
            <div className="card-body">
              {availablePlayers.length === 0 ? (
                <div className="text-muted text-center py-3">
                  No eligible players
                </div>
              ) : (
                availablePlayers.map(p => (
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

        {/* LINEUP */}
        <div className="col-lg-7">
          <LineupSection
            title={`Starting XI (${starters.length}/${MAX_STARTERS})`}
            color="success"
            players={starters}
            onRemove={removeFromLineup}
          />

          <LineupSection
            title={`Substitutes (${subs.length}/${MAX_SUBS})`}
            color="primary"
            players={subs}
            onRemove={removeFromLineup}
          />
        </div>
      </div>

      <div className="mt-4 text-end">
        <button className="btn btn-primary px-4" onClick={saveLineup}>
          Save Lineup
        </button>
      </div>
    </div>
  );
}

/* =========================
   UI COMPONENTS
   ========================= */

function PlayerCard({ player, onStarter, onSub }) {
  return (
    <div className="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
      <div>
        <div className="fw-semibold">
          {player.firstName} {player.lastName}
        </div>
        <small className="text-muted">{player.position || "-"}</small>
      </div>
      <div className="btn-group">
        <button
          className="btn btn-sm btn-success"
          onClick={() => onStarter(player)}
        >
          XI
        </button>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onSub(player)}
        >
          Sub
        </button>
      </div>
    </div>
  );
}

function LineupSection({ title, color, players, onRemove }) {
  return (
    <div className={`card border-${color} mb-3`}>
      <div className={`card-header bg-${color} text-white fw-bold`}>
        {title}
      </div>
      <div className="card-body">
        {players.length === 0 ? (
          <div className="text-muted">Empty</div>
        ) : (
          players.map(p => (
            <div
              key={p._id}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <span>
                {p.firstName} {p.lastName}
              </span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => onRemove(p._id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
