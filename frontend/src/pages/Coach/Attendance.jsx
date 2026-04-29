import { useEffect, useState, useMemo } from "react";
import { Card, Button, Spinner, Row, Col, Form, InputGroup } from "react-bootstrap";
import { 
  FiCalendar, FiClock, FiMapPin, FiSearch, FiDownload, 
  FiCheckSquare, FiUser, FiCheckCircle, FiXCircle, FiAlertCircle, FiActivity 
} from "react-icons/fi";

import api from "../../api/axios";
import { errorAlert } from "../../utils/swal";
import MarkAttendanceModal from "../../components/MarkAttendanceModal";
import HeroBanner from "../../components/HeroBanner";

export default function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [attendance, setAttendance] = useState([]);
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  
  const [activeView, setActiveView] = useState("manage");

  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchSessions();
    fetchHistory();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/attendance/sessions/coach");
      const upcoming = (res.data.sessions || []).filter(s => new Date(s.endAt) >= new Date());
      setSessions(upcoming);
    } catch {
      errorAlert("Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/attendance/coach/history");
      const data = res.data?.records || [];
      setHistory(data);
      setFilteredHistory(data);
    } catch {
      errorAlert("Failed to load attendance history");
    }
  };

  const fetchAttendance = async (bookingId) => {
    try {
      setLoadingAttendance(true);
      const res = await api.get(`/attendance/session/${bookingId}`);
      setAttendance(res.data.attendance || []);
    } catch {
      errorAlert("Failed to load attendance");
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleSessionChange = (e) => {
    const id = e.target.value;
    setSelectedSession(id);
    if (id) fetchAttendance(id);
    else setAttendance([]);
  };

  const handleExport = async () => {
    if (!selectedSession) return errorAlert("Please select a session first");

    try {
      const res = await api.get("/reports/attendance", {
        params: { bookingId: selectedSession, playerName: search },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      errorAlert("Failed to export attendance report");
    }
  };

  useEffect(() => {
    let data = [...history];
    if (dateFilter) {
      data = data.filter((r) => {
        if (!r.bookingId?.startAt) return false;
        const d = new Date(r.bookingId.startAt);
        return d.toISOString().split("T")[0] === dateFilter;
      });
    }
    setFilteredHistory(data);
  }, [dateFilter, history]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter(a => {
      const name = `${a.playerId?.firstName || ''} ${a.playerId?.lastName || ''}`.toLowerCase();
      const matchesSearch = search ? name.includes(search.toLowerCase()) : true;
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [attendance, search, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present": return <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 border border-success border-opacity-25"><FiCheckCircle className="me-1"/> Present</span>;
      case "Absent": return <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 border border-danger border-opacity-25"><FiXCircle className="me-1"/> Absent</span>;
      case "Late": return <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2 border border-warning border-opacity-25"><FiAlertCircle className="me-1"/> Late</span>;
      case "Injured": return <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2 border border-secondary border-opacity-25"><FiActivity className="me-1"/> Injured</span>;
      default: return <span className="badge bg-light text-muted rounded-pill px-3 py-2 border">{status || "-"}</span>;
    }
  };

  const getInitials = (first, last) => ((first?.[0] || "") + (last?.[0] || "")).toUpperCase() || "P";

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      <HeroBanner 
        title="Attendance Management" 
        subtitle="Mark attendance, manage active sessions, and review player history." 
      />

      <div className="d-flex justify-content-center justify-content-md-start mb-4 mt-2">
        <div className="bg-white p-1 rounded-pill d-inline-flex border shadow-sm">
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${activeView === "manage" ? "bg-primary text-white shadow-sm" : "bg-transparent text-muted hover-dark"}`}
            onClick={() => setActiveView("manage")}
          >
            Manage Session
          </button>
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${activeView === "history" ? "bg-primary text-white shadow-sm" : "bg-transparent text-muted hover-dark"}`}
            onClick={() => setActiveView("history")}
          >
            Review History
          </button>
        </div>
      </div>

      {activeView === "manage" && (
        <div className="fade-in">
          <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
            <Card.Body className="p-4">
              <Row className="g-3 align-items-end">
                <Col md={7} lg={8}>
                  <Form.Label className="small fw-bold text-muted text-uppercase letter-spacing-1">Select Active Session</Form.Label>
                  {loadingSessions ? (
                    <div className="d-flex align-items-center text-primary mt-2">
                      <Spinner size="sm" className="me-2"/> Loading upcoming sessions...
                    </div>
                  ) : (
                    <Form.Select 
                      className="rounded-3 border-light shadow-sm bg-light text-dark fw-semibold py-2" 
                      value={selectedSession} 
                      onChange={handleSessionChange}
                    >
                      <option value="">-- Choose a session --</option>
                      {sessions.map((s) => (
                        <option key={s._id} value={s._id}>
                          {new Date(s.startAt).toLocaleDateString()} | {s.facilityId?.name || "TBA"} ({new Date(s.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Col>

                <Col md={5} lg={4} className="text-end d-flex flex-column flex-sm-row justify-content-md-end gap-2">
                  <Button variant="white" className="border shadow-sm text-success fw-bold rounded-3 d-flex align-items-center justify-content-center py-2 px-3" disabled={!selectedSession} onClick={handleExport}>
                    <FiDownload className="me-2" /> Export
                  </Button>
                  <Button variant="primary" className="shadow-sm fw-bold rounded-3 d-flex align-items-center justify-content-center py-2 px-3" disabled={!selectedSession} onClick={() => setShowModal(true)}>
                    <FiCheckSquare className="me-2" /> Mark Attendance
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {selectedSession && (
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="p-3 bg-light bg-opacity-50 border-bottom d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div className="bg-white p-1 rounded-pill d-inline-flex border shadow-sm flex-wrap gap-1">
                  {["All", "Present", "Absent", "Late", "Injured"].map((tab) => (
                    <button
                      key={tab}
                      className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${statusFilter === tab ? "bg-primary text-white shadow-sm" : "bg-transparent text-muted"}`}
                      onClick={() => setStatusFilter(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="d-flex w-100" style={{ maxWidth: "300px" }}>
                  <InputGroup className="bg-white border rounded-pill shadow-sm overflow-hidden">
                    <InputGroup.Text className="bg-transparent border-0 text-muted ps-3 pe-0"><FiSearch /></InputGroup.Text>
                    <Form.Control className="border-0 shadow-none py-2 bg-transparent" placeholder="Search player name..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  </InputGroup>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted small text-uppercase">
                    <tr>
                      <th className="px-4 py-3 fw-bold border-bottom-0 letter-spacing-1">Player</th>
                      <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Status</th>
                      <th className="px-4 py-3 fw-bold border-bottom-0 letter-spacing-1">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {loadingAttendance ? (
                      <tr><td colSpan="3" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                    ) : filteredAttendance.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          <div className="p-3 bg-light rounded-circle d-inline-block mb-3"><FiUser size={24} className="opacity-50" /></div>
                          <p className="mb-0 fw-bold text-dark">No records found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAttendance.map((a) => (
                        <tr key={a._id}>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-light-primary text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                                {getInitials(a.playerId?.firstName, a.playerId?.lastName)}
                              </div>
                              <span className="fw-bold text-dark">{a.playerId?.firstName} {a.playerId?.lastName}</span>
                            </div>
                          </td>
                          <td className="py-3">{getStatusBadge(a.status)}</td>
                          <td className="px-4 py-3 text-muted small">{a.remarks || <span className="fst-italic opacity-50">-</span>}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {!selectedSession && (
            <div className="text-center py-5 mt-4 text-muted border border-dashed rounded-4">
              <FiCalendar size={48} className="mb-3 opacity-25" />
              <h5 className="fw-bold text-dark">Select a Session</h5>
              <p className="small">Please choose an upcoming session to view or mark attendance.</p>
            </div>
          )}
        </div>
      )}

      {activeView === "history" && (
        <Card className="border-0 shadow-sm rounded-4 bg-white fade-in overflow-hidden">
          <div className="p-4 border-bottom bg-light bg-opacity-50">
            <Row className="g-3 align-items-end">
              <Col md={5} lg={4}>
                <Form.Label className="small fw-bold text-muted text-uppercase letter-spacing-1">Filter by Date</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control type="date" className="rounded-3 shadow-sm border-light bg-white py-2" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                  <Button variant="white" className="border shadow-sm rounded-3 px-4" onClick={() => setDateFilter("")}>Reset</Button>
                </div>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small text-uppercase">
                <tr>
                  <th className="px-4 py-3 fw-bold border-bottom-0 letter-spacing-1">Player</th>
                  <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Date</th>
                  <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Session Info</th>
                  <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Status</th>
                  <th className="px-4 py-3 fw-bold border-bottom-0 letter-spacing-1">Remarks</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <div className="p-3 bg-light rounded-circle d-inline-block mb-3"><FiActivity size={24} className="opacity-50" /></div>
                      <p className="mb-0 fw-bold text-dark">No history found</p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((r) => (
                    <tr key={r._id}>
                      <td className="px-4 py-3 fw-bold text-dark">
                        {r.playerId?.firstName} {r.playerId?.lastName}
                      </td>
                      <td className="py-3 fw-semibold">
                        {r.bookingId?.startAt ? new Date(r.bookingId.startAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center text-muted small">
                          <FiMapPin className="me-1" /> {r.bookingId?.facilityId?.name || "TBA"}
                        </div>
                      </td>
                      <td className="py-3">{getStatusBadge(r.status)}</td>
                      <td className="px-4 py-3 text-muted small">{r.remarks || <span className="fst-italic opacity-50">-</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <MarkAttendanceModal
        show={showModal}
        onHide={() => setShowModal(false)}
        bookingId={selectedSession}
        onSaved={() => { 
          const id = selectedSession; 
          fetchAttendance(id); 
          fetchSessions(); 
          setSelectedSession(''); 
          setSessions(prev => prev.filter(s => s._id !== id)); 
        }}
      />

      <style>{`
        .hover-dark:hover { color: #1e293b !important; }
        .letter-spacing-1 { letter-spacing: 0.5px; }
        .bg-light-primary { background-color: rgba(13, 110, 253, 0.1); }
        .border-dashed { border-style: dashed !important; border-width: 2px !important; }
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}