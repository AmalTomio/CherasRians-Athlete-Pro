import React, { useEffect, useState } from "react";
import { Form, Button, Table, Modal } from "react-bootstrap";
import api from "../../api/axios";
import {
  successAlert,
  errorAlert,
} from "../../utils/swal";

export default function Disciplinary() {
  const user = JSON.parse(localStorage.getItem("user"));
  const sport = user?.sport;

  const [cases, setCases] = useState([]);
  const [players, setPlayers] = useState([]);
  const [category, setCategory] = useState("U-15");

  const [form, setForm] = useState({
    playerId: "",
    reason: "",
    description: "",
    severity: "low",
  });

  const [editing, setEditing] = useState(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetchCases();
    fetchPlayers();
  }, [category]);

  const fetchCases = async () => {
    try {
      const res = await api.get("/disciplinary/coach");
      setCases(res.data.data);
    } catch {
      errorAlert("Failed to load cases");
    }
  };

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
    } catch {
      setPlayers([]);
    }
  };

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    try {
      await api.post("/disciplinary", {
        ...form,
        sport,
        category,
      });

      successAlert("Case created");
      setForm({
        playerId: "",
        reason: "",
        description: "",
        severity: "low",
      });
      fetchCases();
    } catch {
      errorAlert("Failed to create case");
    }
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      await api.put(`/disciplinary/${editing._id}`, editing);
      successAlert("Case updated");
      setEditing(null);
      fetchCases();
    } catch {
      errorAlert("Update failed");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Disciplinary Management</h2>

      {/* CATEGORY */}
      <Form.Select
        className="mb-3"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option>U-15</option>
        <option>U-18</option>
      </Form.Select>

      {/* CREATE FORM */}
      <div className="card p-4 mb-4 shadow-sm">
        <h5 className="mb-3">Create Disciplinary Case</h5>

        <Form.Select
          className="mb-2"
          value={form.playerId}
          onChange={(e) =>
            setForm({ ...form, playerId: e.target.value })
          }
        >
          <option value="">Select Player</option>
          {players.map((p) => (
            <option key={p.playerId._id} value={p.playerId._id}>
              {p.playerId.firstName} {p.playerId.lastName}
            </option>
          ))}
        </Form.Select>

        <Form.Control
          className="mb-2"
          placeholder="Reason"
          value={form.reason}
          onChange={(e) =>
            setForm({ ...form, reason: e.target.value })
          }
        />

        <Form.Control
          className="mb-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <Form.Select
          className="mb-2"
          value={form.severity}
          onChange={(e) =>
            setForm({ ...form, severity: e.target.value })
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Form.Select>

        <Button onClick={handleCreate}>Create Case</Button>
      </div>

      {/* CASE TABLE */}
      <div className="card p-3 shadow-sm">
        <h5>Cases</h5>

        <Table striped>
          <thead>
            <tr>
              <th>Player</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {cases.map((c) => (
              <tr key={c._id}>
                <td>
                  {c.playerId?.firstName} {c.playerId?.lastName}
                </td>
                <td>{c.type}</td>
                <td>{c.reason}</td>
                <td>{c.severity}</td>
                <td>{c.status}</td>
                <td>
                  <Button
                    size="sm"
                    onClick={() => setEditing(c)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* EDIT MODAL */}
      <Modal show={!!editing} onHide={() => setEditing(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Case</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {editing && (
            <>
              <Form.Control
                className="mb-2"
                value={editing.reason}
                onChange={(e) =>
                  setEditing({ ...editing, reason: e.target.value })
                }
              />

              <Form.Control
                className="mb-2"
                value={editing.description}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    description: e.target.value,
                  })
                }
              />

              <Form.Select
                className="mb-2"
                value={editing.severity}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    severity: e.target.value,
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>

              <Form.Select
                value={editing.status}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    status: e.target.value,
                  })
                }
              >
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </Form.Select>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}