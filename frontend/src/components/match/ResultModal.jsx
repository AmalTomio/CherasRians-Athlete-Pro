import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";

export default function ResultModal({ show, onHide, match, onSubmit }) {
  const [ourScore, setOurScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (match) {
      setOurScore(match.ourScore || 0);
      setOppScore(match.opponentScore || 0);
    }
  }, [match]);

  const getResultStatus = (our, opp) => {
    if (our > opp) return "win";
    if (our < opp) return "loss";
    return "draw";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const resultStatus = getResultStatus(Number(ourScore), Number(oppScore));

    try {
      await onSubmit(match._id, {
        ourScore: Number(ourScore),
        opponentScore: Number(oppScore),
        result: resultStatus
      });
      Swal.fire("Success", "Match result updated successfully", "success");
      onHide();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Result: vs {match?.opponent}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3 text-center align-items-center">
             <div className="col">
                <Form.Group>
                   <Form.Label className="fw-bold">Our Score</Form.Label>
                   <Form.Control
                     type="number"
                     min="0"
                     value={ourScore}
                     onChange={(e) => setOurScore(e.target.value)}
                     required
                     className="text-center fs-3"
                   />
                </Form.Group>
             </div>
             <div className="col-auto">
                <span className="fs-3 fw-bold text-muted">-</span>
             </div>
             <div className="col">
                <Form.Group>
                   <Form.Label className="fw-bold">Opponent Score</Form.Label>
                   <Form.Control
                     type="number"
                     min="0"
                     value={oppScore}
                     onChange={(e) => setOppScore(e.target.value)}
                     required
                     className="text-center fs-3"
                   />
                </Form.Group>
             </div>
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-muted d-block mb-1">Auto-calculated Status</span>
            <span className={`badge bg-${
              getResultStatus(Number(ourScore), Number(oppScore)) === "win" ? "success" 
              : getResultStatus(Number(ourScore), Number(oppScore)) === "loss" ? "danger" 
              : "secondary"
            } fs-5`}>
               {getResultStatus(Number(ourScore), Number(oppScore)).toUpperCase()}
            </span>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Result"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
