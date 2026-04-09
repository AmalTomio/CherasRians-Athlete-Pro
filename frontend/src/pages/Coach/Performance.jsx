import React, { useState, useEffect } from "react";
import { Form, Spinner, Alert, Button } from "react-bootstrap";
import { successAlert, errorAlert } from "../../utils/swal";

import KPICard from "../../components/performance/KPICard";
import ChartCard from "../../components/performance/ChartCard";
import api from "../../api/axios";
import { SPORT_META, SPORT_DRILLS } from "../../config/sportMeta";
import { getSocket } from "../../socket";

export default function CoachPerformance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const sport = user?.sport || "football";

  const [category, setCategory] = useState("U-15");
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [drillData, setDrillData] = useState({});

  useEffect(() => {
    fetchPlayers();
  }, [category]);

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

  const history = data?.metrics?.history || [];

const historyData = history.map((h) => ({
  name: new Date(h.date).toLocaleDateString(),
  value: h.rating,
}));

  useEffect(() => {
    const drills = SPORT_DRILLS[sport] || [];
    const initial = {};
    drills.forEach((d) => (initial[d] = 0));
    setDrillData(initial);
  }, [sport, selectedPlayer]);

  useEffect(() => {
    if (selectedPlayer) loadPlayer();
  }, [selectedPlayer, category]);

  const loadPlayer = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/performance/player/${selectedPlayer}`);
      setData(res.data.data);
    } catch {
      setError("Failed to load player performance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("dashboard_update", loadPlayer);
    return () => socket.off("dashboard_update", loadPlayer);
  }, [selectedPlayer]);

  const handleSubmit = async () => {
    try {
      console.log("Submitting drills:", drillData);

      await api.post("/performance/update", {
        playerId: selectedPlayer,
        sport,
        category,
        drills: drillData,
      });

      successAlert("Performance updated successfully!");
      loadPlayer();
    } catch (err) {
      console.error(err);
      errorAlert("Failed to update performance");
    }
  };

  const avgRating =
    Object.values(drillData).length > 0
      ? (
          Object.values(drillData).reduce((a, b) => a + b, 0) /
          Object.values(drillData).length
        ).toFixed(1)
      : 0;

  const drillMetrics = data?.metrics?.drills || {};

  const chartData = Object.entries(drillMetrics).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Player Performance</h2>

      {/* CATEGORY */}
      <Form.Select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mb-3"
      >
        {SPORT_META[sport]?.categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Form.Select>

      {/* PLAYER */}
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

      {/* INPUT */}
      {selectedPlayer && (
        <div className="card p-4 mb-4 shadow-sm">
          <h5 className="fw-bold mb-3">Training Performance Input</h5>

          <div className="row g-3">
            {(SPORT_DRILLS[sport] || []).map((drill) => (
              <div className="col-md-4" key={drill}>
                <Form.Label>{drill}</Form.Label>
                <Form.Range
                  min={0}
                  max={10}
                  value={drillData[drill] || 0}
                  onChange={(e) =>
                    setDrillData({
                      ...drillData,
                      [drill]: Number(e.target.value),
                    })
                  }
                />
                <div className="text-end small fw-bold">
                  {drillData[drill]}/10
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 fw-bold text-primary">
            Estimated Avg Skill Rating: {avgRating}
          </div>

          <Button className="mt-3" onClick={handleSubmit}>
            Save Performance
          </Button>
        </div>
      )}

      {loading && <Spinner />}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* ANALYTICS */}
      {data && (
        <>
          <div className="row g-4 mb-4">
            <KPICard
              title="Avg Skill Rating"
              value={data.metrics?.averageRating?.toFixed(1)}
            />
            <KPICard
              title="Training Score"
              value={data.metrics?.score?.toFixed(0)}
            />
          </div>

          <ChartCard
            title="Training Performance (Drills)"
            type="bar"
            data={chartData}
          />
          <ChartCard
  title="Performance Progress (Rating Over Time)"
  type="line"
  data={historyData}
/>
        </>
      )}
    </div>
  );
}