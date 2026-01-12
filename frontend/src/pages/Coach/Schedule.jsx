import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, Spinner, Row, Col, Form, Badge } from "react-bootstrap";
import { Calendar, CheckCircle, People } from "react-bootstrap-icons";


export default function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [totalPlayers, setTotalPlayers] = useState(0);

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
        params: { limit: 1 }, // we only need total
      });
      setTotalPlayers(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch total players", err);
      setTotalPlayers(0);
    }
  };

  const filteredSchedules =
    typeFilter === "all"
      ? schedules
      : schedules.filter((s) => s.sessionType === typeFilter);

  return (
    <div className="px-4 py-4 w-100">
      {/* ================= Header ================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Schedule Management</h1>
          <p className="text-muted mb-0">
            Plan and organize your team training sessions and events
          </p>
        </div>

      </div>

      {/* ================= Stats Cards ================= */}
      <Row className="g-4 mb-4">
        {/* Total Sessions */}
        <Col md={3}>
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted fw-medium mb-1">Total Sessions</div>
                <div className="fs-2 fw-bold">{schedules.length}</div>
                <div className="small text-muted mt-1">This week</div>
              </div>
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#e0edff",
                  color: "#2563eb",
                }}
              >
                <Calendar size={22} />
              </div>
            </div>
          </div>
        </Col>

        {/* Approved */}
        <Col md={3}>
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted fw-medium mb-1">Approved</div>
                <div className="fs-2 fw-bold">{schedules.length}</div>
                <div className="small text-success mt-1">Ready to go</div>
              </div>
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#e7f9ef",
                  color: "#16a34a",
                }}
              >
                <CheckCircle size={22} />
              </div>
            </div>
          </div>
        </Col>

        {/* Participants */}
        <Col md={3}>
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted fw-medium mb-1">Participants</div>
                <div className="fs-2 fw-bold">{totalPlayers}</div>
                <div className="small mt-1" style={{ color: "#9333ea" }}>
                  Total players
                </div>
              </div>
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#f3e8ff",
                  color: "#9333ea",
                }}
              >
                <People size={22} />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* ================= Filters ================= */}
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

      {/* ================= Schedule Grid ================= */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="text-muted text-center py-5">No scheduled sessions</div>
      ) : (
        <Row className="g-4">
          {filteredSchedules.map((s) => (
            <Col md={4} key={s._id}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <Badge bg="primary" className="text-capitalize">
                      {s.sessionType}
                    </Badge>
                    <Badge bg="success">Approved</Badge>
                  </div>

                  <h5>{s.title}</h5>

                  <div className="mt-3 text-muted">
                    <div>📅 {new Date(s.sessionDate).toLocaleDateString()}</div>
                    <div>
                      ⏰ {s.startTime} – {s.endTime}
                    </div>
                    <div>📍 {s.facilityId?.name}</div>
                    <div>👥 {s.playerCategory}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      
    </div>
  );
}
