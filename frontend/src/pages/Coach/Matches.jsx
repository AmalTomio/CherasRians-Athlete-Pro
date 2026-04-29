import React, { useState, useEffect, useMemo } from "react";
import { Spinner, Form, InputGroup, Pagination, Dropdown } from "react-bootstrap";
import moment from "moment";
import { 
  FiSearch, FiClock, FiMapPin, 
  FiCheckCircle, FiXCircle, FiAlertCircle, 
  FiFlag, FiMoreVertical, FiPlus, FiBarChart2, FiTarget
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

  const stats = useMemo(() => {
    const total = matches.length;
    const upcoming = matches.filter(m => m.status === "scheduled").length;
    const completed = matches.filter(m => m.status === "completed").length;
    const cancelled = matches.filter(m => m.status === "cancelled").length;
    return { total, upcoming, completed, cancelled };
  }, [matches]);

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
    const lineupId =
      typeof match.lineupId === "object"
        ? match.lineupId._id
        : match.lineupId;

    if (!lineupId) {
      return errorAlert("No lineup assigned to this match");
    }

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
      successAlert("Match cancelled");
      fetchMatches(true);
    } catch (err) {
      console.error(err);
      errorAlert(err.response?.data?.message || "Failed to cancel match");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 border border-success border-opacity-25"><FiCheckCircle className="me-1"/> Completed</span>;
      case "cancelled":
        return <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 border border-danger border-opacity-25"><FiXCircle className="me-1"/> Cancelled</span>;
      default:
        return <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2 border border-warning border-opacity-25"><FiClock className="me-1"/> Upcoming</span>;
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

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mt-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <Spinner size="sm" /> Loading...
                  </td>
                </tr>
              ) : (
                paginatedData.map((m) => {
                  // ✅ FIX: DEFINE HERE
                  const our = m.score?.our ?? 0;
                  const opp = m.score?.opponent ?? 0;

                  return (
                    <tr key={m._id}>
                      <td className="px-4 py-3">
                        <div className="fw-bold">vs {m.opponent}</div>
                        <small className="text-muted">
                          <FiMapPin /> {m.venue}
                        </small>
                      </td>

                      <td>
                        {moment(m.matchDate).format("DD MMM YYYY")}
                      </td>

                      <td className="text-center">
                        {m.status === "completed" ? (
                          <div className="fw-bold">
                            <span className={our > opp ? "text-success" : ""}>
                              {our}
                            </span>
                            <span className="mx-2">-</span>
                            <span className={opp > our ? "text-danger" : ""}>
                              {opp}
                            </span>
                          </div>
                        ) : "TBD"}
                      </td>

                      <td>{getStatusBadge(m.status)}</td>

                      <td className="text-end">
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm">
                            <FiMoreVertical />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => openResultModal(m)}>
                              Update Result
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => openStatsModal(m)}>
                              Player Stats
                            </Dropdown.Item>
                            <Dropdown.Item
                              className="text-danger"
                              onClick={() => handleCancelMatch(m._id)}
                            >
                              Cancel Match
                            </Dropdown.Item>
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
      </div>

      {/* MODALS */}
      <MatchModal
        show={showScheduleModal}
        onHide={() => setShowScheduleModal(false)}
        onSaved={handleSaved}
      />

      {selectedMatch && (
        <>
          <ResultModal
            show={showResultModal}
            onHide={() => setShowResultModal(false)}
            matchId={selectedMatch._id}
            onSaved={handleSaved}
          />
          <StatsForm
            show={showStatsModal}
            onHide={() => setShowStatsModal(false)}
            matchId={selectedMatch._id}
            lineupId={selectedMatch.lineupId}
            sport={selectedMatch.sport}
            onSaved={handleSaved}
          />
        </>
      )}
    </div>
  );
}