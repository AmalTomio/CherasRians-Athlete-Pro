import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import api from "../api/axios";
import { errorAlert, successAlert } from "../utils/swal";
import { SPORT_STATS } from "../config/sportMeta";

export default function StatsForm({ show, onHide, matchId, lineupId, sport, onSaved }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [stats, setStats] = useState({ minutesPlayed: 0 });

  const currentSport = (sport || "football").toLowerCase();
  const statFields = SPORT_STATS[currentSport] || [];

  useEffect(() => {
    if (show && lineupId) fetchPlayers();
  }, [show, lineupId]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/team-lineup/${lineupId}`);
      const lineup = res.data.lineup;
      if (!lineup) return errorAlert("Lineup not found");

      setPlayers([...(lineup.starters || []), ...(lineup.substitutes || [])]);
    } catch (err) {
      errorAlert("Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const handleStatChange = (e) => {
    const val = Math.max(0, Number(e.target.value)); // Security: Prevent negative stats
    setStats({ ...stats, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlayer) return errorAlert("Please select a player");

    setSaving(true);
    try {
      await api.post(`/matches/stats/${matchId}`, {
        stats: [{
          playerId: selectedPlayer,
          minutesPlayed: stats.minutesPlayed || 0,
          stats: Object.fromEntries(statFields.map((field) => [field, stats[field] || 0]))
        }],
      });
      successAlert("Player stats updated!");
      onSaved();
    } catch (err) {
      errorAlert(err.response?.data?.message || "Failed to update stats");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className="border-0 bg-light">
        <Modal.Title className="fw-bold fs-5 text-dark">Record Player Stats</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small text-secondary text-uppercase tracking-wide">Athlete</Form.Label>
              <Form.Select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                required
                className="shadow-sm border-0 bg-light py-2"
              >
                <option value="" disabled>-- Select Athlete --</option>
                {players.map((p) => {
                  const id = p.playerId?._id || p.student?._id || p._id;
                  const fName = p.playerId?.firstName || p.student?.firstName || p.firstName || "Unknown";
                  const lName = p.playerId?.lastName || p.student?.lastName || p.lastName || "";
                  return <option key={id} value={id}>{fName} {lName}</option>;
                })}
              </Form.Select>
            </Form.Group>

            <div className="bg-light p-3 rounded-4 mb-4">
              <h6 className="fw-bold mb-3 text-dark">Match Contributions</h6>
              <Row className="g-3">
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="small fw-medium text-muted">Minutes Played</Form.Label>
                    <Form.Control type="number" min="0" name="minutesPlayed" value={stats.minutesPlayed} onChange={handleStatChange} className="border-0 shadow-sm" />
                  </Form.Group>
                </Col>
                {statFields.map((field) => (
                  <Col xs={6} key={field}>
                    <Form.Group>
                      <Form.Label className="small fw-medium text-muted text-capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Form.Label>
                      <Form.Control type="number" min="0" name={field} value={stats[field] || 0} onChange={handleStatChange} className="border-0 shadow-sm" />
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </div>

            <Button variant="primary" type="submit" className="w-100 fw-bold rounded-pill py-2 shadow-sm" disabled={saving}>
              {saving ? <><Spinner size="sm" className="me-2"/> Saving...</> : "Commit Statistics"}
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}