import React, { useState, useEffect } from "react";
import { Form, Spinner, Alert, Button, Card, Table, Modal, Badge, Row, Col } from "react-bootstrap";
import { successAlert, errorAlert } from "../../utils/swal";
import { 
  FiFilter, FiSave, FiActivity, FiUser, FiEdit3, FiX, FiBarChart2, FiAward, FiTrendingUp
} from "react-icons/fi";

import api from "../../api/axios";
import { SPORT_META, SPORT_DRILLS } from "../../config/sportMeta";
import ChartCard from "../../components/performance/ChartCard";

export default function CoachPerformance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const sport = user?.sport || "football";

  const [category, setCategory] = useState("U-15");
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [error, setError] = useState(null);

  const [showAssessModal, setShowAssessModal] = useState(false);
  const [activePlayer, setActivePlayer] = useState(null);
  const [drillData, setDrillData] = useState({});
  const [saving, setSaving] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, [category]);

  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    setError(null);
    try {
      const res = await api.get("/team-lineup", { params: { sport, category } });
      const lineup = res.data.lineup;
      const combined = [
        ...(lineup?.starters || []),
        ...(lineup?.substitutes || []),
      ];
      setPlayers(combined);
    } catch (err) {
      console.error(err);
      setError("Failed to load squad roster. Please try again.");
      setPlayers([]);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const handleOpenAssess = (player) => {
    setActivePlayer(player);
    const drills = SPORT_DRILLS[sport] || [];
    const initial = {};
    drills.forEach((d) => (initial[d] = 0));
    setDrillData(initial);
    setShowAssessModal(true);
  };

  const handleCloseAssess = () => {
    setShowAssessModal(false);
    setTimeout(() => setActivePlayer(null), 300);
  };

  const handleSubmitAssessment = async () => {
    if (!activePlayer) return;
    setSaving(true);

    try {
      await api.post("/performance/update", {
        playerId: activePlayer.playerId._id,
        sport,
        category,
        drills: drillData,
      });

      successAlert("Performance logged successfully!");
      handleCloseAssess();
    } catch (err) {
      console.error(err);
      errorAlert("Failed to update performance");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenHistory = async (player) => {
    setActivePlayer(player);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    setHistoryData(null);

    try {
      const res = await api.get(`/performance/player/${player.playerId._id}`);
      setHistoryData(res.data.data);
    } catch (err) {
      console.error(err);
      errorAlert("Failed to load player history data.");
      setShowHistoryModal(false);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseHistory = () => {
    setShowHistoryModal(false);
    setTimeout(() => setActivePlayer(null), 300);
  };

  const currentSessionAvg = Object.values(drillData).length > 0
    ? (Object.values(drillData).reduce((a, b) => a + b, 0) / Object.values(drillData).length).toFixed(1)
    : 0;

  const drillMetrics = historyData?.metrics?.drills || {};
  const currentSkillsData = Object.entries(drillMetrics).map(([name, value]) => ({
    name: name.replace(/([A-Z])/g, ' $1').trim(), 
    value: Number(value).toFixed(1),
  }));

  const historyLogs = historyData?.metrics?.history || [];
  const performanceTrendData = historyLogs.map((h) => ({
    name: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: h.rating,
  }));

  return (
    <div className="px-4 py-4" >
      
      <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="mb-1 text-dark fw-bold">Player Performance Logs</h2>
                <p className="text-muted mb-0">Manage player performance logs.</p>
              </div>
            </div>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-0">
          
          <div className="p-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-light rounded-top-4">
            <h6 className="fw-bold mb-0 text-uppercase text-muted small d-flex align-items-center" style={{ letterSpacing: '0.5px' }}>
              <FiFilter className="me-2"/> Target Squad
            </h6>
            <div style={{ minWidth: '200px' }}>
              <Form.Select 
                className="bg-white border-0 py-2 fw-medium shadow-sm rounded-pill px-3"
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                disabled={loadingPlayers}
              >
                {SPORT_META[sport]?.categories.map((c) => (
                  <option key={c} value={c}>{c} Squad</option>
                ))}
              </Form.Select>
            </div>
          </div>

          <div className="table-responsive">
            <Table hover className="mb-0 align-middle custom-table">
              <thead className="bg-white">
                <tr>
                  <th className="text-muted small fw-semibold text-uppercase px-4 py-3 border-0">Athlete Name</th>
                  <th className="text-muted small fw-semibold text-uppercase py-3 border-0">Position</th>
                  <th className="text-muted small fw-semibold text-uppercase text-end px-4 py-3 border-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingPlayers ? (
                  <tr>
                    <td colSpan="3" className="text-center py-5">
                      <Spinner animation="border" variant="primary" size="sm" className="me-2"/>
                      <span className="text-muted fw-medium">Loading roster...</span>
                    </td>
                  </tr>
                ) : players.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-5 text-muted">
                      <FiUser size={32} className="mb-2 opacity-25" />
                      <p className="mb-0 fw-medium">No players found in this squad category.</p>
                    </td>
                  </tr>
                ) : (
                  players.map((p) => (
                    <tr key={p.playerId._id} style={{ cursor: "pointer" }} onClick={() => handleOpenAssess(p)}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                            {p.playerId.firstName.charAt(0)}{p.playerId.lastName.charAt(0)}
                          </div>
                          <div>
                            <span className="fw-bold text-dark d-block">{p.playerId.firstName} {p.playerId.lastName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge bg="light" text="dark" className="border fw-medium px-3 py-2 rounded-pill">
                          {p.position || "Unassigned"}
                        </Badge>
                      </td>
                      <td className="text-end px-4 py-3">
                        <div className="d-flex justify-content-end gap-2">
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="rounded-pill px-3 fw-bold d-flex align-items-center gap-2 text-primary border"
                            onClick={(e) => { e.stopPropagation(); handleOpenHistory(p); }}
                          >
                            <FiBarChart2 /> History
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-pill px-3 fw-bold d-flex align-items-center gap-2 shadow-sm"
                            onClick={(e) => { e.stopPropagation(); handleOpenAssess(p); }}
                          >
                            <FiEdit3 /> Assess
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showAssessModal} onHide={handleCloseAssess} centered backdrop="static" size="md">
        <Modal.Header className="border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-start">
          <div>
            <h5 className="fw-bolder mb-1 text-dark">Log Performance</h5>
            <p className="text-muted small mb-0">
              Assessing <strong className="text-primary">{activePlayer?.playerId.firstName} {activePlayer?.playerId.lastName}</strong>
            </p>
          </div>
          <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-muted" onClick={handleCloseAssess}>
            <FiX size={20} />
          </button>
        </Modal.Header>
        
        <Modal.Body className="px-4 py-4">
          <div className="d-flex flex-column gap-3">
            {(SPORT_DRILLS[sport] || []).map((drill) => {
              const label = drill.replace(/([A-Z])/g, ' $1').trim();
              return (
                <div key={drill} className="p-3 bg-light rounded-4 border border-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="mb-0 fw-bold text-dark small text-capitalize">{label}</Form.Label>
                    <span className="badge bg-white text-primary border shadow-sm px-2 py-1" style={{ width: '45px' }}>
                      {drillData[drill] || 0}
                    </span>
                  </div>
                  <Form.Range
                    className="custom-range"
                    min={0} max={10} step={1}
                    value={drillData[drill] || 0}
                    onChange={(e) => setDrillData({ ...drillData, [drill]: Number(e.target.value) })}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded-4 d-flex justify-content-between align-items-center border border-primary border-opacity-25">
            <span className="fw-bold text-primary small text-uppercase" style={{ letterSpacing: '0.5px' }}>Session Average</span>
            <span className="fs-3 fw-black text-primary lh-1">{currentSessionAvg}</span>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 px-4 pb-4 pt-0">
          <Button variant="light" className="fw-bold rounded-pill px-4" onClick={handleCloseAssess} disabled={saving}>Cancel</Button>
          <Button variant="primary" className="fw-bold rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" onClick={handleSubmitAssessment} disabled={saving}>
            {saving ? <Spinner size="sm" animation="border" /> : <FiSave />}
            {saving ? "Saving..." : "Save Assessment"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showHistoryModal} onHide={handleCloseHistory} centered size="lg">
        <Modal.Header className="border-bottom bg-light px-4 py-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '45px', height: '45px', fontSize: '1.2rem' }}>
              {activePlayer?.playerId.firstName.charAt(0)}{activePlayer?.playerId.lastName.charAt(0)}
            </div>
            <div>
              <h5 className="fw-bolder mb-0 text-dark">{activePlayer?.playerId.firstName} {activePlayer?.playerId.lastName}</h5>
              <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.5px' }}>Performance Analytics</span>
            </div>
          </div>
          <button className="btn btn-white border shadow-sm rounded-circle p-2 d-flex align-items-center justify-content-center text-muted" onClick={handleCloseHistory}>
            <FiX size={20} />
          </button>
        </Modal.Header>
        
        <Modal.Body className="p-4" style={{ backgroundColor: '#f8fafc' }}>
          {loadingHistory ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <span className="text-muted fw-medium">Loading historical data...</span>
            </div>
          ) : !historyData ? (
            <div className="text-center py-5 text-muted">
              <FiActivity size={40} className="mb-3 opacity-25" />
              <h5>No Performance History</h5>
              <p className="small">This player has not been assessed yet.</p>
            </div>
          ) : (
            <>
              {/* KPIs Row */}
              <Row className="g-3 mb-4">
                <Col md={6}>
                   <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-4 d-flex align-items-center gap-3">
                      <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle"><FiAward size={24}/></div>
                      <div>
                        <p className="text-muted mb-0 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px'}}>Skill Rating</p>
                        <h3 className="fw-black mb-0 text-dark lh-1">{historyData.metrics?.averageRating?.toFixed(1) || "0.0"} <span className="fs-6 text-muted fw-medium">/ 10</span></h3>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-4 d-flex align-items-center gap-3">
                      <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle"><FiTrendingUp size={24}/></div>
                      <div>
                        <p className="text-muted mb-0 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px'}}>Training Score</p>
                        <h3 className="fw-black mb-0 text-dark lh-1">{historyData.metrics?.score?.toFixed(0) || "0"} <span className="fs-6 text-muted fw-medium">pts</span></h3>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Charts Row */}
              <Row className="g-4">
                <Col xs={12}>
                  <ChartCard
                    title="Skill Set Breakdown"
                    type="bar"
                    data={currentSkillsData}
                    height={260}
                    color="#3b82f6"
                  />
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
      </Modal>

      <style>{`
        .custom-range::-webkit-slider-thumb {
          background: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        .custom-table th { background-color: transparent !important; border-bottom: 2px solid #f1f5f9 !important; }
        .custom-table td { border-bottom: 1px solid #f8fafc; }
        .custom-table tbody tr:hover td { background-color: #f8fafc !important; }
      `}</style>
    </div>
  );
}