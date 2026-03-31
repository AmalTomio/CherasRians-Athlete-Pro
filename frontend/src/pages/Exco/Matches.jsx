import React, { useState, useEffect } from "react";
import { Form, Spinner, Alert } from "react-bootstrap";
import api from "../../api/axios";
import { SPORT_META } from "../../config/sportMeta";
import MatchTable from "../../components/match/MatchTable";
import { getSocket } from "../../socket";

export default function ExcoMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterSport, setFilterSport] = useState("all");

  const fetchMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/matches/exco");
      let data = res.data.matches || [];
      if (filterSport !== "all") {
        data = data.filter(m => m.sport === filterSport);
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
    // eslint-disable-next-line
  }, [filterSport]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => fetchMatches(true);
    socket.on("dashboard_update", handler);
    return () => {
      socket.off("dashboard_update", handler);
    };
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1 text-dark fw-bold">All Matches Overview</h2>
        <p className="text-muted mb-0">View all matches across different sports categories.</p>
      </div>

      <div className="card shadow-sm border-0 mb-4 rounded-4 bg-white">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Label className="fw-medium text-muted">Filter by Sport</Form.Label>
              <Form.Select 
                value={filterSport} 
                onChange={(e) => setFilterSport(e.target.value)}
              >
                <option value="all">All Sports</option>
                {Object.keys(SPORT_META).map(sport => (
                  <option key={sport} value={sport}>{sport.replace("_", " ").toUpperCase()}</option>
                ))}
              </Form.Select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
           <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <MatchTable 
          matches={matches} 
          role="exco"
          onAddResult={() => {}} // Disabled for exco
          onAddStats={() => {}} // Disabled for exco
        />
      )}
    </div>
  );
}
