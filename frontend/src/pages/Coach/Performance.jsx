import React, { useState, useEffect } from "react";
import { Form, Spinner, Alert, Button } from "react-bootstrap";
import { FiStar, FiClock, FiActivity, FiTarget } from "react-icons/fi";

import KPICard from "../../components/performance/KPICard";
import ChartCard from "../../components/performance/ChartCard";
import api from "../../api/axios";
import { SPORT_META } from "../../config/sportMeta";
import { getSocket } from "../../socket";

export default function CoachPerformance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const sport = user?.sport || "football";

  const [mode, setMode] = useState("player");
  const [category, setCategory] = useState("U-15");
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ================= FETCH PLAYERS ================= */
  useEffect(() => {
    if (mode === "player") fetchPlayers();
  }, [category, mode]);

  const fetchPlayers = async () => {
    try {
      const res = await api.get("/team-lineup", {
        params: { sport, category },
      });

      const lineup = res.data.lineup;
      const combined = [
        ...(lineup?.starters || []),
        ...(lineup?.substitutes || []),
      ];

      setPlayers(combined);

      if (combined.length > 0) {
        setSelectedPlayer(combined[0].playerId?._id);
      }
    } catch (err) {
      console.error(err);
      setPlayers([]);
    }
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (mode === "player" && selectedPlayer) loadPlayer();
    if (mode === "team") loadTeam();
  }, [mode, selectedPlayer, category]);

  const loadPlayer = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/performance/player/${selectedPlayer}`);
      setData(res.data.data);
    } catch (err) {
      setError("Failed to load player performance");
    } finally {
      setLoading(false);
    }
  };

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await api.get("/performance/team", {
        params: { category },
      });
      setData(res.data.data);
    } catch {
      setError("Failed to load team performance");
    } finally {
      setLoading(false);
    }
  };

  /* ================= REALTIME ================= */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = () => {
      if (mode === "player") loadPlayer();
      else loadTeam();
    };

    socket.on("dashboard_update", handler);
    return () => socket.off("dashboard_update", handler);
  }, [mode, selectedPlayer, category]);

  /* ================= UI ================= */

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Performance Analytics</h2>

        <div className="btn-group">
          <Button onClick={() => setMode("player")}>Player</Button>
          <Button onClick={() => setMode("team")}>Team</Button>
        </div>
      </div>

      {/* FILTER */}
      <Form.Select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mb-3"
      >
        {SPORT_META[sport]?.categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Form.Select>

      {mode === "player" && (
        <Form.Select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="mb-3"
        >
          {players.map((p) => (
            <option key={p.playerId._id} value={p.playerId._id}>
              {p.playerId.firstName} {p.playerId.lastName}
            </option>
          ))}
        </Form.Select>
      )}

      {/* STATES */}
      {loading && <Spinner />}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* DATA */}
      {data && (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <KPICard
                title="Matches"
                value={data.metrics?.matchesPlayed || data.totalMatches}
                icon={<FiActivity />}
              />
            </div>

            {mode === "player" ? (
              <>
                <KPICard title="Rating" value={data.metrics.averageRating.toFixed(1)} />
                <KPICard title="Minutes" value={data.metrics.totalMinutesPlayed} />
                <KPICard title="Score" value={data.metrics.score.toFixed(0)} />
              </>
            ) : (
              <>
                <KPICard title="Wins" value={data.wins} />
                <KPICard title="Losses" value={data.losses} />
                <KPICard title="Draws" value={data.draws} />
              </>
            )}
          </div>

          {/* PLAYER CHART */}
          {mode === "player" && data.metrics?.stats && (
            <ChartCard
              title="Stats"
              type="bar"
              options={{
                xaxis: {
                  categories: Object.keys(data.metrics.stats),
                },
              }}
              series={[
                {
                  data: Object.values(data.metrics.stats),
                },
              ]}
            />
          )}

          {/* TEAM CHART */}
          {mode === "team" && (
            <ChartCard
              title="Results"
              type="donut"
              options={{ labels: ["Wins", "Losses", "Draws"] }}
              series={[data.wins, data.losses, data.draws]}
            />
          )}
        </>
      )}
    </div>
  );
}