import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Card,
  Spinner,
  Row,
  Col,
  Form,
  Badge,
  Button,
} from "react-bootstrap";
import {
  Calendar,
  CheckCircle,
  People,
  Eye,
  ClipboardCheck,
} from "react-bootstrap-icons";

import MarkAttendanceModal from "../../components/MarkAttendanceModal";

export default function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [totalPlayers, setTotalPlayers] = useState(0);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAttendance, setShowAttendance] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchTotalPlayers();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/schedules/coach");
      setSchedules(res.data || []);
    } catch (err) {
      console.error("Failed to load schedules", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalPlayers = async () => {
    try {
      const res = await api.get("/coach/players", {
        params: { limit: 1 },
      });
      setTotalPlayers(res.data.total || 0);
    } catch {
      setTotalPlayers(0);
    }
  };

  /* ================= FILTER ================= */
  const filteredSchedules =
    typeFilter === "all"
      ? schedules
      : schedules.filter((s) => s.sessionType === typeFilter);

  /* ================= ACTION ================= */

  const handleAttendance = (schedule) => {
    // IMPORTANT: attendance uses bookingId
    if (!schedule.bookingId) {
      alert("No booking linked to this schedule");
      return;
    }

    setSelectedBooking(schedule.bookingId);
    setShowAttendance(true);
  };

  /* ================= RENDER ================= */

  return (
    <div className="px-4 py-4 w-100">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold">Schedule Management</h2>
        <p className="text-muted">
          Manage training sessions and attendance
        </p>
      </div>

      {/* STATS */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <StatCard title="Sessions" value={schedules.length} icon={<Calendar />} />
        </Col>

        <Col md={3}>
          <StatCard title="Approved" value={schedules.length} icon={<CheckCircle />} />
        </Col>

        <Col md={3}>
          <StatCard title="Players" value={totalPlayers} icon={<People />} />
        </Col>
      </Row>

      {/* FILTER */}
      <Card className="p-3 mb-4">
        <Form.Select
          style={{ width: 220 }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="training">Training</option>
          <option value="practice">Practice</option>
          <option value="tryout">Tryout</option>
          <option value="event">Event</option>
          <option value="meeting">Meeting</option>
        </Form.Select>
      </Card>

      {/* GRID */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="text-muted text-center py-5">
          No scheduled sessions
        </div>
      ) : (
        <Row className="g-4">
          {filteredSchedules.map((s) => {
            const isTraining =
              s.sessionType === "training" || s.sessionType === "tryout";

            return (
              <Col md={4} key={s._id}>
                <Card className="h-100 shadow-sm hover-lift">
                  <Card.Body>
                    {/* HEADER */}
                    <div className="d-flex justify-content-between mb-2">
                      <Badge bg="primary" className="text-capitalize">
                        {s.sessionType}
                      </Badge>
                      <Badge bg="success">Approved</Badge>
                    </div>

                    <h5 className="fw-bold">{s.title}</h5>

                    {/* INFO */}
                    <div className="mt-3 text-muted small">
                      <div>📅 {new Date(s.sessionDate).toLocaleDateString()}</div>
                      <div>⏰ {s.startTime} – {s.endTime}</div>
                      <div>📍 {s.facilityId?.name}</div>
                      <div>👥 {s.playerCategory || "-"}</div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-4 d-flex gap-2 flex-wrap">

                      <Button size="sm" variant="outline-primary">
                        <Eye className="me-1" /> View
                      </Button>

                      {isTraining && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleAttendance(s)}
                        >
                          <ClipboardCheck className="me-1" />
                          Attendance
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* MODAL */}
      <MarkAttendanceModal
        show={showAttendance}
        onHide={() => setShowAttendance(false)}
        bookingId={selectedBooking}
        onSaved={fetchSchedules}
      />
    </div>
  );
}

/* ================= COMPONENT ================= */

function StatCard({ title, value, icon }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <div className="text-muted small">{title}</div>
          <div className="fs-3 fw-bold">{value}</div>
        </div>
        <div className="fs-4 text-primary">{icon}</div>
      </div>
    </div>
  );
}