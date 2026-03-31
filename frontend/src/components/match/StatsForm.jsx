import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import PlayerStatsRow from "./PlayerStatsRow";
import api from "../../api/axios";
import { SPORT_STATS } from "../../config/sportMeta";
import Swal from "sweetalert2";

export default function StatsForm({ show, onHide, matchId, sport }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // The dynamic stats fields available for this sport
  const statFields = SPORT_STATS[sport] || [];

  useEffect(() => {
    if (show && matchId) {
      fetchMatchPlayers();
    }
    // eslint-disable-next-line
  }, [show, matchId]);

  const fetchMatchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/matches/${matchId}`);
      const matchData = res.data.match;
      const lineupPlayers = matchData?.lineup?.players || [];
      
      // Initialize state for form
      const initialStats = lineupPlayers.map(p => {
         const base = {
           playerId: p.student?._id || p._id,
           name: p.student?.firstName ? `${p.student.firstName} ${p.student.lastName}` : "Unknown Player",
           minutesPlayed: 0,
           rating: 5,
           stats: {}
         };
         statFields.forEach(sf => {
           base.stats[sf] = 0;
         });
         return base;
      });

      setPlayers(initialStats);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const handleStatChange = (playerId, field, value, isDynamicStat = false) => {
    setPlayers(prev => prev.map(p => {
      if (p.playerId === playerId) {
        if (isDynamicStat) {
          return { ...p, stats: { ...p.stats, [field]: Number(value) } };
        }
        return { ...p, [field]: Number(value) };
      }
      return p;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Payload mapping
    const payload = {
      players: players.map(p => ({
        playerId: p.playerId,
        minutesPlayed: p.minutesPlayed,
        rating: p.rating,
        stats: p.stats
      }))
    };

    try {
      await api.post(`/matches/${matchId}/stats`, payload);
      Swal.fire("Success", "Player statistics saved successfully", "success");
      onHide();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to save stats", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Enter Player Stats ({sport})</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light">
        {loading ? (
           <div className="text-center py-5">
             <Spinner animation="border" variant="primary" />
             <p className="mt-2 text-muted">Loading players...</p>
           </div>
        ) : error ? (
           <Alert variant="danger">{error}</Alert>
        ) : players.length === 0 ? (
           <div className="alert alert-warning text-center">
             No lineup available for this match.
           </div>
        ) : (
           <div className="table-responsive bg-white shadow-sm rounded-3">
             <table className="table table-hover align-middle mb-0">
               <thead className="table-light">
                 <tr>
                   <th style={{ width: "20%" }}>Player Name</th>
                   <th style={{ width: "10%" }} className="text-center">Mins Played</th>
                   <th style={{ width: "10%" }} className="text-center">Rating (1-10)</th>
                   {statFields.map(sf => (
                     <th key={sf} className="text-center text-capitalize">{sf.replace("_", " ")}</th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                  {players.map(p => (
                    <PlayerStatsRow 
                      key={p.playerId}
                      player={p}
                      statFields={statFields}
                      onChange={handleStatChange}
                    />
                  ))}
               </tbody>
             </table>
           </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>Close</Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={submitting || players.length === 0 || loading}
        >
          {submitting ? "Saving..." : "Save All Stats"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
