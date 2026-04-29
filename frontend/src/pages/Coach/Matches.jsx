import React, { useState, useEffect, useMemo } from "react";
import { Spinner, Form, InputGroup, Pagination, Dropdown, Badge, Card } from "react-bootstrap";
import moment from "moment";
import { 
  FiSearch, FiClock, FiMapPin, 
  FiCheckCircle, FiXCircle, FiMoreVertical, FiPlus, FiCalendar
} from "react-icons/fi";

import api from "../../api/axios";
import { errorAlert, successAlert } from "../../utils/swal";
import HeroBanner from "../../components/HeroBanner";
import ResultModal from "../../components/ResultModal";
import StatsForm from "../../components/StatsForm";
import MatchModal from "../../components/MatchModal"; 

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const fetchMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/matches/coach");
      setMatches(res.data?.matches || []);
    } catch (err) {
      console.error("Fetch matches error:", err);
      errorAlert("Failed to load matches");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const filteredData = useMemo(() => {
    return matches.filter((m) => {
      const keyword = search.toLowerCase();
      const matchesSearch = 
        m.opponent?.toLowerCase().includes(keyword) || 
        m.venue?.toLowerCase().includes(keyword);

      const status = (m.status || "scheduled").toLowerCase();
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Upcoming" && status === "scheduled") ||
        status === activeTab.toLowerCase();

      return matchesSearch && matchesTab;
    });
  }, [matches, search, activeTab]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const openResultModal = (match) => {
    setSelectedMatch(match);
    setShowResultModal(true);
  };

  const openStatsModal = (match) => {
    const lineupId = typeof match.lineupId === "object" ? match.lineupId._id : match.lineupId;
    if (!lineupId) return errorAlert("No lineup assigned to this match");

    setSelectedMatch({ ...match, lineupId });
    setShowStatsModal(true);
  };

  const handleSaved = () => {
    fetchMatches(true);
    setShowScheduleModal(false);
    setShowResultModal(false);
    setShowStatsModal(false);
    setSelectedMatch(null);
  };

  const handleCancelMatch = async (matchId) => {
    try {
      await api.patch(`/matches/${matchId}/cancel`);
      successAlert("Match cancelled successfully");
      fetchMatches(true);
    } catch (err) {
      errorAlert(err.response?.data?.message || "Failed to cancel match");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge bg="success" className="bg-opacity-10 text-success border border-success px-3 py-2 rounded-pill"><FiCheckCircle className="me-1"/> Completed</Badge>;
      case "cancelled":
        return <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger px-3 py-2 rounded-pill"><FiXCircle className="me-1"/> Cancelled</Badge>;
      default:
        return <Badge bg="warning" className="bg-opacity-10 text-warning border border-warning px-3 py-2 rounded-pill"><FiClock className="me-1"/> Upcoming</Badge>;
    }
  };

  const tabs = ["All", "Upcoming", "Completed", "Cancelled"];

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      <HeroBanner
        title="Match Fixtures & Results"
        subtitle="Oversee upcoming games, record final scores, and update player statistics."
        buttonText="Schedule Match"
        buttonIcon={FiPlus}
        onButtonClick={() => setShowScheduleModal(true)}
      />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-4 mb-3">
        <div className="bg-white rounded-pill border shadow-sm p-1 d-inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-4 fw-semibold border-0 ${
                activeTab === tab
                  ? "btn-primary text-white shadow-sm"
                  : "btn-white text-muted"
              }`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <InputGroup className="w-auto shadow-sm rounded-pill overflow-hidden border bg-white" style={{ minWidth: '300px' }}>
          <InputGroup.Text className="bg-transparent border-0 ps-3 text-muted">
            <FiSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search opponent or venue..."
            className="border-0 shadow-none bg-transparent py-2"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </InputGroup>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small text-uppercase tracking-wide">
                <tr>
                  <th className="ps-4 py-3 fw-bold border-bottom-0">Match Details</th>
                  <th className="py-3 fw-bold border-bottom-0">Date & Time</th>
                  <th className="text-center py-3 fw-bold border-bottom-0">Score</th>
                  <th className="py-3 fw-bold border-bottom-0">Status</th>
                  <th className="text-end pe-4 py-3 fw-bold border-bottom-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5"><Spinner size="md" variant="primary" className="me-2" /> Loading fixtures...</td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted"><FiCalendar className="fs-1 mb-3 text-light" /><br/>No matches found.</td></tr>
                ) : (
                  paginatedData.map((m) => {
                    const our = m.score?.our ?? 0;
                    const opp = m.score?.opponent ?? 0;

                    return (
                      <tr key={m._id} className="border-bottom">
                        <td className="ps-4 py-3">
                          <div className="fw-bold text-dark fs-6">vs {m.opponent}</div>
                          <div className="text-muted small mt-1 d-flex align-items-center">
                            <FiMapPin className="me-1" /> {m.venue}
                          </div>
                        </td>
                        <td className="text-secondary fw-medium">
                          <div className="fw-bold text-dark">{moment(m.matchDate).format("DD MMM YYYY")}</div>
                          <div className="text-muted small"><FiClock className="me-1" /> {m.matchTime || "TBD"}</div>
                        </td>
                        <td className="text-center">
                          {m.status === "completed" ? (
                            <div className="bg-light d-inline-block px-3 py-1 rounded-3 fw-bold fs-6">
                              <span className={our > opp ? "text-success" : ""}>{our}</span>
                              <span className="mx-2 text-muted">-</span>
                              <span className={opp > our ? "text-danger" : ""}>{opp}</span>
                            </div>
                          ) : <span className="text-muted fw-medium">—</span>}
                        </td>
                        <td>{getStatusBadge(m.status)}</td>
                        <td className="text-end pe-4">
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="light" className="btn-sm rounded-circle p-2 shadow-sm border-0">
                              <FiMoreVertical />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="border-0 shadow-sm rounded-3">
                              <Dropdown.Item onClick={() => openResultModal(m)} className="py-2">Update Result</Dropdown.Item>
                              <Dropdown.Item onClick={() => openStatsModal(m)} className="py-2">Player Stats</Dropdown.Item>
                              {m.status !== 'cancelled' && (
                                <>
                                  <Dropdown.Divider />
                                  <Dropdown.Item className="text-danger py-2 fw-medium" onClick={() => handleCancelMatch(m._id)}>Cancel Match</Dropdown.Item>
                                </>
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {!loading && totalPages > 1 && (
            <div className="bg-light p-3 d-flex justify-content-between align-items-center border-top">
               <span className="small text-muted">Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
            </div>
          )}
        </Card.Body>
      </Card>

      <MatchModal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} onSaved={handleSaved} />
      {selectedMatch && (
        <>
          <ResultModal show={showResultModal} onHide={() => setShowResultModal(false)} matchId={selectedMatch._id} onSaved={handleSaved} />
          <StatsForm show={showStatsModal} onHide={() => setShowStatsModal(false)} matchId={selectedMatch._id} lineupId={selectedMatch.lineupId} sport={selectedMatch.sport} onSaved={handleSaved} />
        </>
      )}
    </div>
  );
}