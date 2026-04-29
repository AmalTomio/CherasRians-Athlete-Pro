import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import api from "../api/axios";
import { errorAlert, successAlert } from "../utils/swal";
import { SPORT_STATS } from "../config/sportMeta";

export default function StatsForm({
  show,
  onHide,
  matchId,
  lineupId,
  sport,
  onSaved,
}) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState("");

  const [stats, setStats] = useState({
    minutesPlayed: 0,
  });

  /* ================= DERIVE SPORT ================= */
  const currentSport = (sport || "football").toLowerCase();
  const statFields = SPORT_STATS[currentSport] || [];

  /* ================= FETCH PLAYERS ================= */
  useEffect(() => {
    if (show && lineupId) {
      fetchPlayers();
    }
  }, [show, lineupId]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);

      if (!lineupId) {
        return errorAlert("No lineup assigned");
      }

      const res = await api.get(`/team-lineup/${lineupId}`);

      const lineup = res.data.lineup;

      if (!lineup) {
        return errorAlert("Lineup not found");
      }

      const allPlayers = [
        ...(lineup.starters || []),
        ...(lineup.substitutes || []),
      ];

      setPlayers(allPlayers);
    } catch (err) {
      console.error("FETCH PLAYERS ERROR:", err);
      errorAlert("Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE INPUT ================= */
  const handleStatChange = (e) => {
    setStats({
      ...stats,
      [e.target.name]: Number(e.target.value),
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlayer) {
      return errorAlert("Please select a player");
    }

    setSaving(true);

    try {
      await api.post(`/matches/stats/${matchId}`, {
        stats: [
          {
            playerId: selectedPlayer,
            minutesPlayed: stats.minutesPlayed || 0,
            stats: Object.fromEntries(
              statFields.map((field) => [field, stats[field] || 0])
            ),
          },
        ],
      });

      successAlert("Player stats updated!");
      onSaved();
    } catch (err) {
      console.error("SAVE ERROR:", err);
      errorAlert(err.response?.data?.message || "Failed to update stats");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          Update Player Stats
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {/* PLAYER SELECT */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small text-muted">
                Select Player
              </Form.Label>

              <Form.Select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                required
                className="shadow-sm"
              >
                <option value="">-- Choose a player --</option>

                {players.map((p) => {
                  const id =
                    p.playerId?._id || p.student?._id || p._id;

                  const fName =
                    p.playerId?.firstName ||
                    p.student?.firstName ||
                    p.firstName ||
                    "Unknown";

                  const lName =
                    p.playerId?.lastName ||
                    p.student?.lastName ||
                    p.lastName ||
                    "";

                  return (
                    <option key={id} value={id}>
                      {fName} {lName}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>

            {/* DYNAMIC STATS */}
            <div className="row g-3 mb-4">
              {statFields.map((field) => (
                <div className="col-6" key={field}>
                  <Form.Label className="fw-bold small text-muted text-capitalize">
                    {field}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name={field}
                    value={stats[field] || 0}
                    onChange={handleStatChange}
                  />
                </div>
              ))}

              {/* MINUTES */}
              <div className="col-12">
                <Form.Label className="fw-bold small text-muted">
                  Minutes Played
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="minutesPlayed"
                  value={stats.minutesPlayed}
                  onChange={handleStatChange}
                />
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              className="w-100 fw-bold rounded-pill"
              disabled={saving}
            >
              {saving ? <Spinner size="sm" /> : "Save Statistics"}
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}