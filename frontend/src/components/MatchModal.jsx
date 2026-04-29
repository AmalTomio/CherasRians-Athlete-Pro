import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { FiUsers, FiMapPin, FiCalendar, FiClock, FiTag, FiClipboard } from "react-icons/fi";
import api from "../api/axios";
import { errorAlert, successAlert } from "../utils/swal";

export default function MatchModal({ show, onHide, onSaved }) {
  const initialState = {
    opponent: "",
    matchDate: "",
    matchTime: "",
    venue: "",
    category: "U-15",
    lineupId: "", 
  };

  const [formData, setFormData] = useState(initialState);
  const [lineups, setLineups] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH LINEUPS ================= */
  useEffect(() => {
    if (!show) return;
    
    // Reset form when modal opens
    setFormData(initialState);

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

  // Filter lineups dynamically based on selected category
  const filteredLineups = lineups.filter((l) => l.category === formData.category);

  /* ================= UI ================= */
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="border-0 bg-light pb-4">
        <Modal.Title className="fw-bold fs-4 text-dark">
          Schedule Match Fixture
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4 pt-2">
        <Form onSubmit={handleSubmit}>
          
          <div className="bg-white p-3 rounded-4 border shadow-sm mb-4">
            <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom">Match Details</h6>
            <Row className="g-3">
              {/* Opponent */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-secondary mb-1">
                    <FiUsers className="me-1 mb-1"/> Opponent Team
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="opponent"
                    placeholder="e.g. SMK Cheras"
                    value={formData.opponent}
                    onChange={handleChange}
                    required
                    className="shadow-sm border-0 bg-light py-2"
                  />
                </Form.Group>
              </Col>

              {/* Venue */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-secondary mb-1">
                    <FiMapPin className="me-1 mb-1"/> Venue
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="venue"
                    placeholder="e.g. Home Ground"
                    value={formData.venue}
                    onChange={handleChange}
                    required
                    className="shadow-sm border-0 bg-light py-2"
                  />
                </Form.Group>
              </Col>

              {/* Date */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-secondary mb-1">
                    <FiCalendar className="me-1 mb-1"/> Match Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="matchDate"
                    value={formData.matchDate}
                    onChange={handleChange}
                    required
                    className="shadow-sm border-0 bg-light py-2"
                  />
                </Form.Group>
              </Col>

              {/* Time */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-secondary mb-1">
                    <FiClock className="me-1 mb-1"/> Time
                  </Form.Label>
                  <Form.Control
                    type="time"
                    name="matchTime"
                    value={formData.matchTime}
                    onChange={handleChange}
                    className="shadow-sm border-0 bg-light py-2"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="bg-white p-3 rounded-4 border shadow-sm mb-4">
            <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom">Squad Assignment</h6>
            <Row className="g-3">
              {/* Category */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-secondary mb-1">
                    <FiTag className="me-1 mb-1"/> Category
                  </Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="shadow-sm border-0 bg-light py-2"
                  >
                    <option value="U-15">U-15</option>
                    <option value="U-18">U-18</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Lineup */}
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-secondary mb-1">
                    <FiClipboard className="me-1 mb-1"/> Selected Lineup
                  </Form.Label>
                  <Form.Select
                    name="lineupId"
                    value={formData.lineupId}
                    onChange={handleChange}
                    required
                    className="shadow-sm border-0 bg-light py-2"
                  >
                    <option value="" disabled>-- Select a lineup --</option>
                    {filteredLineups.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name ? `${l.name} (${l.category})` : `${l.category} Lineup`}
                      </option>
                    ))}
                  </Form.Select>
                  {filteredLineups.length === 0 && (
                    <Form.Text className="text-danger small mt-1 d-block">
                      <FiTag className="me-1"/> No saved lineups found for {formData.category}.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button
              variant="light"
              onClick={onHide}
              className="fw-bold rounded-pill px-4"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="fw-bold rounded-pill px-4 shadow-sm"
              disabled={loading || filteredLineups.length === 0}
            >
              {loading ? <Spinner size="sm" className="me-2" /> : null}
              Schedule Match
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}