import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Form, Button, Modal, Row, Col } from "react-bootstrap";
import moment from "moment";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";
import { FiPlus, FiEdit3, FiFileText } from "react-icons/fi";

import HeroBanner from "../../components/HeroBanner";
import FiltersCard from "../../components/FiltersCard";
import Table from "../../components/Table";

import { SPORT_STATS } from "../../config/sportMeta";

export default function Matches() {
  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= STATE ================= */
  const [matches, setMatches] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);

  const [showStats, setShowStats] = useState(false);
  const [players, setPlayers] = useState([]);
  const [playerStats, setPlayerStats] = useState({});

  const [form, setForm] = useState({
    opponent: "",
    venue: "",
    matchDate: "",
    category: "U-15",
    lineupId: "",
  });

  const [score, setScore] = useState({ our: "", opponent: "" });

  /* ================= FETCH ================= */
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/matches/coach");
      setMatches(res.data.matches || []);
    } catch {
      errorAlert("Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLineups = useCallback(async () => {
    try {
      const res = await api.get("/team-lineup/all", {
        params: { sport: user.sport },
      });
      setLineups(res.data.lineups || []);
    } catch {
      setLineups([]);
    }
  }, [user.sport]);

  useEffect(() => {
    fetchMatches();
    fetchLineups();
  }, [fetchMatches, fetchLineups]);

  /* ================= CREATE MATCH ================= */
  const handleCreate = async () => {
    if (!form.opponent || !form.venue || !form.matchDate || !form.lineupId) {
      return errorAlert("Complete all fields");
    }

    try {
      await api.post("/matches", form);
      successAlert("Match created");
      setShowCreate(false);
      fetchMatches();
    } catch {
      errorAlert("Create failed");
    }
  };

  /* ================= RESULT ================= */
  const handleSaveResult = async () => {
    try {
      await api.post(`/matches/result/${selected._id}`, {
        ourScore: Number(score.our),
        opponentScore: Number(score.opponent),
      });

      successAlert("Result saved");
      setSelected(null);
      fetchMatches();
    } catch {
      errorAlert("Failed");
    }
  };

  /* ================= FETCH PLAYERS (FIXED) ================= */
  const fetchLineupPlayers = async (match) => {
    try {
      const res = await api.get("/team-lineup", {
        params: {
          sport: match.sport,
          category: match.category,
        },
      });

      const lineup = res.data?.lineup;

      if (!lineup) {
        return errorAlert("Lineup not found");
      }

      const allPlayers = [
        ...(lineup.starters || []),
        ...(lineup.substitutes || []),
      ];

      const init = {};
      allPlayers.forEach((p) => {
        init[p.playerId._id] = {
          minutesPlayed: 0,
          rating: 0,
          stats: {},
        };
      });

      setPlayers(allPlayers);
      setPlayerStats(init);
      setSelected(match);
      setShowStats(true);
    } catch {
      errorAlert("Failed to load players");
    }
  };

  /* ================= INPUT ================= */
  const handleStatChange = (pid, key, value) => {
    setPlayerStats((prev) => ({
      ...prev,
      [pid]: {
        ...prev[pid],
        stats: {
          ...prev[pid].stats,
          [key]: Number(value),
        },
      },
    }));
  };

  const handleFieldChange = (pid, field, value) => {
    setPlayerStats((prev) => ({
      ...prev,
      [pid]: {
        ...prev[pid],
        [field]: Number(value),
      },
    }));
  };

  /* ================= SAVE STATS ================= */
  const handleSaveStats = async () => {
    try {
      const payload = {
        stats: players.map((p) => ({
          playerId: p.playerId._id,
          minutesPlayed: playerStats[p.playerId._id]?.minutesPlayed || 0,
          rating: playerStats[p.playerId._id]?.rating || 0,
          stats: playerStats[p.playerId._id]?.stats || {},
        })),
      };

      await api.post(`/matches/stats/${selected._id}`, payload);

      successAlert("Stats saved");
      setShowStats(false);
    } catch {
      errorAlert("Failed to save stats");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    {
      key: "opponent",
      label: "Opponent",
      accessor: (row) => row.opponent,
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) =>
        moment(row.matchDate).format("DD MMM YYYY"),
    },
    {
      key: "score",
      label: "Score",
      accessor: (row) =>
        row.score ? `${row.score.our}-${row.score.opponent}` : "-",
    },
    {
      key: "action",
      label: "Action",
      accessor: (row) => (
        <div className="d-flex gap-2">
          {row.status !== "completed" ? (
            <Button size="sm" onClick={() => setSelected(row)}>
              <FiEdit3 /> Result
            </Button>
          ) : (
            <Button
              size="sm"
              variant="success"
              onClick={() => fetchLineupPlayers(row)}
            >
              <FiFileText /> Stats
            </Button>
          )}
        </div>
      ),
    },
  ];

  /* ================= UI ================= */
  return (
    <div className="px-4 py-4">
      <HeroBanner
        title="Matches"
        subtitle="Manage fixtures"
        buttonText="Create Match"
        buttonIcon={FiPlus}
        onButtonClick={() => setShowCreate(true)}
      />

      <Table columns={columns} data={matches} loading={loading} />

      {/* ================= CREATE MODAL ================= */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Match</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control
              placeholder="Opponent"
              className="mb-2"
              onChange={(e) =>
                setForm({ ...form, opponent: e.target.value })
              }
            />

            <Form.Control
              placeholder="Venue"
              className="mb-2"
              onChange={(e) =>
                setForm({ ...form, venue: e.target.value })
              }
            />

            <Form.Control
              type="date"
              className="mb-2"
              onChange={(e) =>
                setForm({ ...form, matchDate: e.target.value })
              }
            />

            <Form.Select
              className="mb-2"
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option>U-15</option>
              <option>U-18</option>
            </Form.Select>

            <Form.Select
              onChange={(e) =>
                setForm({ ...form, lineupId: e.target.value })
              }
            >
              <option value="">Select Lineup</option>
              {lineups.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.category}
                </option>
              ))}
            </Form.Select>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleCreate}>Create</Button>
        </Modal.Footer>
      </Modal>

      {/* ================= STATS MODAL ================= */}
      <Modal show={showStats} onHide={() => setShowStats(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Player Stats</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {players.map((p) => {
            const pid = p.playerId._id;
            const fields = SPORT_STATS[user.sport] || [];

            return (
              <div key={pid} className="border p-3 mb-3">
                <b>
                  {p.playerId.firstName} {p.playerId.lastName}
                </b>

                <Row className="mt-2">
                  <Col>
                    <Form.Control
                      placeholder="Minutes"
                      type="number"
                      onChange={(e) =>
                        handleFieldChange(pid, "minutesPlayed", e.target.value)
                      }
                    />
                  </Col>

                  <Col>
                    <Form.Control
                      placeholder="Rating"
                      type="number"
                      onChange={(e) =>
                        handleFieldChange(pid, "rating", e.target.value)
                      }
                    />
                  </Col>
                </Row>

                <Row className="mt-2">
                  {fields.map((f) => (
                    <Col key={f}>
                      <Form.Control
                        placeholder={f}
                        type="number"
                        onChange={(e) =>
                          handleStatChange(pid, f, e.target.value)
                        }
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            );
          })}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleSaveStats}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}