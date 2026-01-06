import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, Button, Table, Spinner, Row, Col, Form } from "react-bootstrap";
import { errorAlert } from "../../utils/swal";
import MarkAttendanceModal from "../../components/MarkAttendanceModal";

export default function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/attendance/sessions/coach");
      setSessions(res.data.sessions || []);
    } catch {
      errorAlert("Failed to load sessions");
    } finally {
      setLoadingSessions(false);
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

  return (
    <div className="px-4 py-4 w-100">
      <h1 className="mb-2">Attendance</h1>
      <p className="text-muted mb-4">
        Mark attendance for approved training & tryout sessions
      </p>

      <Card className="p-4 mb-4">
        <Row className="g-3 align-items-end">
          <Col md={6}>
            <Form.Label>Select Session</Form.Label>
            {loadingSessions ? (
              <Spinner size="sm" />
            ) : (
              <Form.Select value={selectedSession} onChange={handleSessionChange}>
                <option value="">-- Select session --</option>
                {sessions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.facilityId?.name} •{" "}
                    {new Date(s.startAt).toLocaleDateString()} •{" "}
                    {new Date(s.startAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(s.endAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </option>
                ))}
              </Form.Select>
            )}
          </Col>

          <Col md={6} className="text-end">
            <Button
              variant="primary"
              disabled={!selectedSession}
              onClick={() => setShowModal(true)}
            >
              Mark Attendance
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Card.Body>
          {loadingAttendance ? (
            <Spinner />
          ) : attendance.length === 0 ? (
            <div className="text-muted text-center py-4">
              No attendance records
            </div>
          ) : (
            <Table hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a, i) => (
                  <tr key={a._id}>
                    <td>{i + 1}</td>
                    <td>
                      {a.playerId?.firstName} {a.playerId?.lastName}
                    </td>
                    <td>{a.status}</td>
                    <td>{a.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <MarkAttendanceModal
        show={showModal}
        onHide={() => setShowModal(false)}
        bookingId={selectedSession}
        onSaved={() => fetchAttendance(selectedSession)}
      />
    </div>
  );
}
