import React, { useEffect, useState } from "react";
import { Form, Button, Table, Modal, Row, Col } from "react-bootstrap";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";

export default function Matches() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [matches, setMatches] = useState([]);
  const [lineups, setLineups] = useState([]);

  const [form, setForm] = useState({
    opponent: "",
    venue: "",
    matchDate: "",
    category: "U-15",
    lineupId: "",
  });

  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState({ our: "", opponent: "" });

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchMatches();
    fetchLineups();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await api.get("/matches/coach");
      setMatches(res.data.matches || []);
    } catch {
      errorAlert("Failed to load matches");
    }
  };

  /* 🔥 FIXED LINEUP FETCH */
  const fetchLineups = async () => {
    try {
      const res = await api.get("/team-lineup/all", {
        params: { sport: user.sport },
      });

      setLineups(res.data.lineups || []);
    } catch (err) {
      console.error("Lineup fetch error:", err);
      setLineups([]);
    }
  };

  /* 🔥 FILTER LINEUPS BY CATEGORY */
  const filteredLineups = lineups.filter(
    (l) => l.category === form.category
  );

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    if (!form.lineupId) {
      return errorAlert("Please select lineup");
    }

    try {
      await api.post("/matches", form);

      successAlert("Match created");

      setForm({
        opponent: "",
        venue: "",
        matchDate: "",
        category: "U-15",
        lineupId: "",
      });

      fetchMatches();
    } catch {
      errorAlert("Failed to create match");
    }
  };

  /* ================= SAVE RESULT ================= */
  const handleSaveResult = async () => {
    try {
      await api.post(`/matches/result/${selected._id}`, {
        ourScore: Number(score.our),
        opponentScore: Number(score.opponent),
      });

      successAlert("Result updated");

      setSelected(null);
      setScore({ our: "", opponent: "" });

      fetchMatches();
    } catch {
      errorAlert("Failed to update result");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="container py-4">
      <h2 className="mb-4">Match Management</h2>

      {/* CREATE FORM */}
      <div className="card p-4 mb-4 shadow-sm">
        <h5>Create Match</h5>

        <Row>
          <Col>
            <Form.Control
              placeholder="Opponent"
              value={form.opponent}
              onChange={(e) =>
                setForm({ ...form, opponent: e.target.value })
              }
            />
          </Col>

          <Col>
            <Form.Control
              placeholder="Venue"
              value={form.venue}
              onChange={(e) =>
                setForm({ ...form, venue: e.target.value })
              }
            />
          </Col>
        </Row>

        <Row className="mt-2">
          <Col>
            <Form.Control
              type="date"
              value={form.matchDate}
              onChange={(e) =>
                setForm({ ...form, matchDate: e.target.value })
              }
            />
          </Col>

          <Col>
            <Form.Select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                  lineupId: "", // 🔥 reset lineup when category changes
                })
              }
            >
              <option value="U-15">U-15</option>
              <option value="U-18">U-18</option>
            </Form.Select>
          </Col>
        </Row>

        {/* 🔥 FIXED DROPDOWN */}
        <Form.Select
          className="mt-2"
          value={form.lineupId}
          onChange={(e) =>
            setForm({ ...form, lineupId: e.target.value })
          }
        >
          <option value="">Select Lineup</option>

          {filteredLineups.length === 0 ? (
            <option disabled>No lineup available</option>
          ) : (
            filteredLineups.map((l) => (
              <option key={l._id} value={l._id}>
                {l.category} - {l.sport}
              </option>
            ))
          )}
        </Form.Select>

        <Button className="mt-3" onClick={handleCreate}>
          Create Match
        </Button>
      </div>

      {/* MATCH TABLE */}
      <div className="card p-3 shadow-sm">
        <h5>Matches</h5>

        <Table striped hover>
          <thead>
            <tr>
              <th>Opponent</th>
              <th>Date</th>
              <th>Category</th>
              <th>Status</th>
              <th>Score</th>
              <th>Result</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {matches.map((m) => (
              <tr key={m._id}>
                <td>{m.opponent}</td>
                <td>{new Date(m.matchDate).toLocaleDateString()}</td>
                <td>{m.category}</td>
                <td>{m.status}</td>
                <td>
                  {m.score
                    ? `${m.score.our} - ${m.score.opponent}`
                    : "-"}
                </td>
                <td>{m.result || "-"}</td>
                <td>
                  {m.status !== "completed" && (
                    <Button
                      size="sm"
                      onClick={() => setSelected(m)}
                    >
                      Update Result
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* RESULT MODAL */}
      <Modal show={!!selected} onHide={() => setSelected(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Result</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Control
            className="mb-2"
            placeholder="Our Score"
            value={score.our}
            onChange={(e) =>
              setScore({ ...score, our: e.target.value })
            }
          />

          <Form.Control
            placeholder="Opponent Score"
            value={score.opponent}
            onChange={(e) =>
              setScore({ ...score, opponent: e.target.value })
            }
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Cancel
          </Button>
          <Button onClick={handleSaveResult}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}