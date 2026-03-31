import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, Spinner, Badge } from "react-bootstrap";

export default function Training() {
  const [sessions, setSessions] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    const res = await api.get("/schedules/player");

    const list = res.data?.schedules || [];

    const safeList = Array.isArray(list) ? list : [];

    setSessions(safeList);

    const attendanceData = {};

    for (const s of safeList) {
      if (!s.bookingId) continue;

      const resAtt = await api.get(
        `/attendance/session/${s.bookingId}`
      );

      const records = resAtt.data?.data || resAtt.data || [];

      if (records.length > 0) {
        attendanceData[s._id] = records[0].status;
      }
    }

    setAttendanceMap(attendanceData);
  } catch (err) {
    console.error("Training fetch error", err);
  } finally {
    setLoading(false);
  }
};

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );

  return (
    <div className="px-4 py-4">
      <h3 className="fw-bold mb-4">My Training</h3>

      {sessions.length === 0 ? (
        <div className="text-muted">No training sessions</div>
      ) : (
        (Array.isArray(sessions) ? sessions : []).map((s) => (
          <Card key={s._id} className="mb-3 shadow-sm">
            <Card.Body className="d-flex justify-content-between">
              <div>
                <h6 className="fw-bold">{s.title}</h6>
                <div className="text-muted small">
                  {new Date(s.sessionDate).toLocaleDateString()}
                </div>
              </div>

              <Badge bg={getStatusColor(attendanceMap[s._id])}>
                {attendanceMap[s._id] || "Pending"}
              </Badge>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "Present":
      return "success";
    case "Absent":
      return "danger";
    case "Late":
      return "warning";
    default:
      return "secondary";
  }
}