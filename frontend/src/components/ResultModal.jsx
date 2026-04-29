import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import api from "../api/axios";
import { errorAlert, successAlert } from "../utils/swal";

export default function ResultModal({ show, onHide, matchId, onSaved }) {
  const [scores, setScores] = useState({
    homeScore: 0,
    awayScore: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setScores({ homeScore: 0, awayScore: 0 });
    }
  }, [show]);

  const handleChange = (e) => {
    setScores({ ...scores, [e.target.name]: Number(e.target.value) });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  console.log("CALLING API:", `/matches/${matchId}`, scores);
  try {
    await api.patch(`/matches/${matchId}`, {

      ourScore: scores.homeScore,
      opponentScore: scores.awayScore,
    });

    successAlert("Match result updated successfully!");
    onSaved();
  } catch (err) {
    console.error("Failed to update result:", err.response?.data);
    errorAlert(err.response?.data?.message || "Failed to save result");
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold text-dark">Update Final Result</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <p className="text-muted small mb-4">
          Enter the final score. Saving this will mark the match as <strong>Completed</strong>.
        </p>

        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-4 align-items-center">
            <Col xs={5}>
              <Form.Group className="text-center">
                <Form.Label className="fw-bold small text-muted text-uppercase letter-spacing-1">Your Team</Form.Label>
                <Form.Control 
                  type="number" 
                  min="0"
                  name="homeScore"
                  value={scores.homeScore}
                  onChange={handleChange}
                  className="text-center fs-3 fw-bold shadow-sm py-2"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={2} className="text-center">
              <span className="text-muted fw-bold fs-4">-</span>
            </Col>

            <Col xs={5}>
              <Form.Group className="text-center">
                <Form.Label className="fw-bold small text-muted text-uppercase letter-spacing-1">Opponent</Form.Label>
                <Form.Control 
                  type="number" 
                  min="0"
                  name="awayScore"
                  value={scores.awayScore}
                  onChange={handleChange}
                  className="text-center fs-3 fw-bold shadow-sm py-2"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 fw-bold rounded-pill py-2" 
            disabled={loading}
          >
            {loading ? <Spinner size="sm" animation="border" /> : "Save Result"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}