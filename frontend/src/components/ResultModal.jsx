import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import api from "../api/axios";
import { errorAlert, successAlert } from "../utils/swal";

export default function ResultModal({ show, onHide, matchId, onSaved }) {
  const [scores, setScores] = useState({ homeScore: 0, awayScore: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) setScores({ homeScore: 0, awayScore: 0 });
  }, [show]);

  const handleChange = (e) => {
    const val = Math.max(0, Number(e.target.value)); // Security: Prevent negative scores
    setScores({ ...scores, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/matches/${matchId}`, {
        ourScore: scores.homeScore,
        opponentScore: scores.awayScore,
      });
      successAlert("Match result updated successfully!");
      onSaved();
    } catch (err) {
      errorAlert(err.response?.data?.message || "Failed to save result");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm" backdrop="static">
      <Modal.Body className="p-4 text-center">
        <h4 className="fw-bolder mb-1 text-dark">Final Score</h4>
        <p className="text-muted small mb-4">Confirming this marks the match as <span className="fw-bold text-success">Completed</span>.</p>

        <Form onSubmit={handleSubmit}>
          <div className="bg-light rounded-4 p-3 mb-4 shadow-sm">
            <Row className="g-0 align-items-center justify-content-center">
              <Col xs={5}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-primary text-uppercase mb-2">Us</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="0"
                    name="homeScore"
                    value={scores.homeScore}
                    onChange={handleChange}
                    className="text-center fs-1 fw-bolder border-0 bg-white shadow-sm rounded-3 py-2"
                    required
                  />
                </Form.Group>
              </Col>

              <Col xs={2} className="text-center">
                <span className="text-secondary fw-bolder fs-3">:</span>
              </Col>

              <Col xs={5}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-danger text-uppercase mb-2">Them</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="0"
                    name="awayScore"
                    value={scores.awayScore}
                    onChange={handleChange}
                    className="text-center fs-1 fw-bolder border-0 bg-white shadow-sm rounded-3 py-2"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="d-flex gap-2">
            <Button variant="light" onClick={onHide} className="w-50 fw-bold rounded-pill" disabled={loading}>Cancel</Button>
            <Button variant="dark" type="submit" className="w-50 fw-bold rounded-pill" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Confirm"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}