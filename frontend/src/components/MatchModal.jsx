import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import api from "../api/axios";
import { errorAlert, successAlert } from "../utils/swal";

export default function MatchModal({ show, onHide, onSaved }) {
  const [formData, setFormData] = useState({
    opponent: "",
    matchDate: "",
    matchTime: "",
    venue: "",
    category: "U-15",
    lineupId: "", // ✅ REQUIRED
  });

  const [lineups, setLineups] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH LINEUPS ================= */
  useEffect(() => {
    if (!show) return;

    const fetchLineups = async () => {
      try {
        const res = await api.get("/team-lineup/all");
        setLineups(res.data.lineups || []);
      } catch (err) {
        console.error(err);
        setLineups([]);
      }
    };

    fetchLineups();
  }, [show]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/matches", {
        opponent: formData.opponent,
        venue: formData.venue,
        matchDate: formData.matchDate,
        category: formData.category,
        lineupId: formData.lineupId,
      });

      successAlert("Match scheduled successfully!");
      onSaved();
    } catch (err) {
      console.error("500 Error Details:", err.response?.data);
      errorAlert(
        err.response?.data?.message ||
          "Failed to schedule match. Check console."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          Schedule New Match
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Opponent */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small text-muted">
              Opponent Team
            </Form.Label>
            <Form.Control
              type="text"
              name="opponent"
              placeholder="e.g. SMK Cheras"
              value={formData.opponent}
              onChange={handleChange}
              required
              className="shadow-sm"
            />
          </Form.Group>

          {/* Date + Time */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold small text-muted">
                  Match Date
                </Form.Label>
                <Form.Control
                  type="date"
                  name="matchDate"
                  value={formData.matchDate}
                  onChange={handleChange}
                  required
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold small text-muted">
                  Time
                </Form.Label>
                <Form.Control
                  type="time"
                  name="matchTime"
                  value={formData.matchTime}
                  onChange={handleChange}
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Venue */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small text-muted">
              Venue
            </Form.Label>
            <Form.Control
              type="text"
              name="venue"
              placeholder="e.g. Home Ground"
              value={formData.venue}
              onChange={handleChange}
              required
              className="shadow-sm"
            />
          </Form.Group>

          {/* Category */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small text-muted">
              Category
            </Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="U-15">U-15</option>
              <option value="U-18">U-18</option>
            </Form.Select>
          </Form.Group>

          {/* Lineup */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold small text-muted">
              Lineup
            </Form.Label>
            <Form.Select
              name="lineupId"
              value={formData.lineupId}
              onChange={handleChange}
              required
            >
              <option value="">Select lineup</option>
              {lineups
                .filter((l) => l.category === formData.category)
                .map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.category}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 fw-bold rounded-pill"
            disabled={loading}
          >
            {loading ? "Scheduling..." : "Schedule Match"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}