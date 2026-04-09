import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import moment from "moment-timezone";
import api from "../../api/axios";
import { SPORT_META } from "../../config/sportMeta";
import MatchTable from "../../components/match/MatchTable";
import ResultModal from "../../components/match/ResultModal";
import StatsForm from "../../components/match/StatsForm";
import { getSocket } from "../../socket";
import Swal from "sweetalert2";

export default function CoachMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterSport, setFilterSport] = useState("football");
  const [filterCategory, setFilterCategory] = useState("");
  
  const [showCreate, setShowCreate] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const [selectedMatch, setSelectedMatch] = useState(null);
  
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    opponent: "",
    matchDate: "",
    venue: "",
    category: "",
    sport: filterSport
  });

  const fetchMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/matches/coach");
      let data = res.data.matches || [];
      
      if (filterSport) {
        data = data.filter(m => m.sport === filterSport);
      }
      if (filterCategory) {
        data = data.filter(m => m.category === filterCategory);
      }
      setMatches(data);
    } catch (err) {
      if (!silent) setError("Failed to fetch matches. Please try again later.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [filterSport, filterCategory]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => fetchMatches(true);
    socket.on("dashboard_update", handler);
    return () => {
      socket.off("dashboard_update", handler);
    };
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      // 1. Fetch Lineup
      const lineupRes = await api.get("/team-lineup", {
        params: { sport: formData.sport, category: formData.category }
      });

      const lineup = lineupRes.data.lineups?.[0] || lineupRes.data.lineup;

      if (!lineup) {
        throw new Error("No lineup found for this sport and category. Please create a lineup first.");
      }

      // 2. Create Match
      await api.post("/matches", {
        opponent: formData.opponent,
        matchDate: formData.matchDate,
        venue: formData.venue,
        sport: formData.sport,
        category: formData.category,
        lineupId: lineup._id 
      });

      Swal.fire("Success", "Match created successfully", "success");
      setShowCreate(false);
      setFormData({ ...formData, opponent: "", matchDate: "", venue: "", category: "" });
      fetchMatches();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message || "Failed to create match", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleResultSubmit = async (matchId, resultData) => {
    await api.post(`/matches/${matchId}/result`, resultData);
    fetchMatches(true);
  };

  const openResultModal = (match) => {
    setSelectedMatch(match);
    setShowResult(true);
  };

  const openStatsModal = (match) => {
    setSelectedMatch(match);
    setShowStats(true);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 text-dark fw-bold">Match Management</h2>
          <p className="text-muted mb-0">Manage your team's matches, results, and player stats.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          + Create Match
        </Button>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4 rounded-4 bg-white">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Label className="fw-medium text-muted">Sport</Form.Label>
              <Form.Select 
                value={filterSport} 
                onChange={(e) => {
                  setFilterSport(e.target.value);
                  setFilterCategory(""); // Reset category when sport changes
                  setFormData(prev => ({ ...prev, sport: e.target.value }));
                }}
              >
                {Object.keys(SPORT_META).map(sport => (
                  <option key={sport} value={sport}>{sport.replace("_", " ").toUpperCase()}</option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Label className="fw-medium text-muted">Category</Form.Label>
              <Form.Select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {(SPORT_META[filterSport]?.categories || []).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </div>
          </div>
        </div>
      </div>

      {/* Matches Content */}
      {loading ? (
        <div className="text-center py-5">
           <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <MatchTable 
          matches={matches} 
          role="coach" 
          onAddResult={openResultModal} 
          onAddStats={openStatsModal} 
        />
      )}

      {/* Create Match Modal */}
      <Modal show={showCreate} onHide={() => !creating && setShowCreate(false)} centered>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Match</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Opponent</Form.Label>
              <Form.Control 
                type="text" 
                required 
                placeholder="e.g. SMK Cheras"
                value={formData.opponent}
                onChange={e => setFormData({...formData, opponent: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Date & Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                required 
                value={formData.matchDate}
                onChange={e => setFormData({...formData, matchDate: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Venue</Form.Label>
              <Form.Control 
                type="text" 
                required 
                placeholder="e.g. Stadium Badminton KL"
                value={formData.venue}
                onChange={e => setFormData({...formData, venue: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                required
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select Category</option>
                {(SPORT_META[formData.sport]?.categories || []).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Lineup will be automatically fetched for the selected category.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)} disabled={creating}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Match"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Result Modal */}
      <ResultModal 
        show={showResult}
        onHide={() => setShowResult(false)}
        match={selectedMatch}
        onSubmit={handleResultSubmit}
      />

      {/* Stats Form */}
      <StatsForm 
        show={showStats}
        onHide={() => {
          setShowStats(false);
          fetchMatches(true);
        }}
        matchId={selectedMatch?._id}
        sport={selectedMatch?.sport || filterSport}
      />
    </div>
  );
}
