import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, Spinner, Badge, Row, Col } from "react-bootstrap";
import moment from "moment";

export default function Training() {
  const [sessions, setSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  /* ================= FETCH ================= */
  const fetchAll = async () => {
    try {
      const [scheduleRes, matchRes] = await Promise.all([
        api.get("/schedules/player"),
        api.get("/matches/player"),
      ]);

      const scheduleList = Array.isArray(scheduleRes.data?.schedules)
        ? scheduleRes.data.schedules
        : [];

      const matchList = Array.isArray(matchRes.data?.matches)
        ? matchRes.data.matches
        : [];

      setSessions(scheduleList);
      setMatches(matchList);
    } catch (err) {
      console.error("Schedule fetch error", err);
      setSessions([]);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= MERGE ================= */
  const combined = [
    ...sessions.map((s) => ({
      ...s,
      type: "training",
    })),

    ...matches.map((m) => ({
      ...m,
      type: "match",
      sessionDate: m.matchDate,
      title: `Match vs ${m.opponent}`,
      startTime: "-",
      endTime: "-",
      attendanceStatus: null,
    })),
  ].sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

  /* ================= GROUP ================= */
  const today = new Date();

  const upcoming = combined.filter(
    (s) => new Date(s.sessionDate) >= today
  );

  const past = combined.filter(
    (s) => new Date(s.sessionDate) < today
  );

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <h3 className="fw-bold mb-4">My Schedule</h3>

      <Section title="Upcoming" data={upcoming} />
      <Section title="Past" data={past} />
    </div>
  );
}

/* ================= COMPONENT ================= */

function Section({ title, data }) {
  if (!data.length) return null;

  return (
    <div className="mb-4">
      <h5 className="mb-3">{title}</h5>

      <Row>
        {data.map((s) => (
          <Col md={6} lg={4} key={`${s.type}-${s._id}`} className="mb-3">
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body>
                {/* 🔥 TYPE LABEL */}
                <div className="mb-2">
                  <Badge bg={s.type === "match" ? "primary" : "info"}>
                    {s.type === "match" ? "MATCH" : "TRAINING"}
                  </Badge>
                </div>

                <h6 className="fw-bold">{s.title}</h6>

                <p className="text-muted small mb-1">
                  📅 {moment(s.sessionDate).format("DD MMM YYYY")}
                </p>

                {s.type === "training" && (
                  <p className="text-muted small mb-2">
                    ⏰ {s.startTime} - {s.endTime}
                  </p>
                )}

                {/* 🔥 ATTENDANCE ONLY FOR TRAINING */}
                {s.type === "training" && (
                  <Badge bg={getStatusColor(s.attendanceStatus)}>
                    {s.attendanceStatus || "Pending"}
                  </Badge>
                )}

                {/* 🔥 MATCH INFO */}
                {s.type === "match" && (
                  <Badge bg="dark">Upcoming Match</Badge>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

/* ================= STATUS COLOR ================= */

function getStatusColor(status) {
  switch (status) {
    case "Present":
      return "success";
    case "Absent":
      return "danger";
    case "Late":
      return "warning";
    case "Injured":
      return "secondary";
    default:
      return "secondary";
  }
}