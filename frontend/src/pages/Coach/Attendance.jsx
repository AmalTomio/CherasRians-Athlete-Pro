import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, Button, Table, Spinner, Row, Col, Form } from "react-bootstrap";
import { errorAlert } from "../../utils/swal";
import MarkAttendanceModal from "../../components/MarkAttendanceModal";
import FiltersCard from "../../components/FiltersCard";
import HeroBanner from "../../components/HeroBanner";

export default function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/attendance/sessions/coach");
      // Filter out past sessions (where endAt is before now)
      const upcoming = (res.data.sessions || []).filter(s => new Date(s.endAt) >= new Date());
      setSessions(upcoming);
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

  const handleExport = async () => {
  if (!selectedSession) {
    return errorAlert("Please select a session first");
  }

  try {
    const res = await api.get("/reports/attendance", {
      params: {
        bookingId: selectedSession,
        playerName: search,
      },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;

    const filename = `attendance_${new Date().toISOString().split("T")[0]}.xlsx`;
    link.setAttribute("download", filename);

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    errorAlert("Failed to export attendance report");
  }
};  

  return (
    <div className="px-4 py-4">
      <HeroBanner title="Attendance" subtitle="Mark attendance for approved training & tryout sessions" />
      <FiltersCard
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        showStatus={true}
        showDate={false}
        onReset={() => { setSearch(""); setStatus(""); }}
        searchPlaceholder="Search player..."
      />

      <Card className="p-4 mb-4">
        <Row className="g-3 align-items-end">
          <Col md={6}>
            <Form.Label>Select Session</Form.Label>
            {loadingSessions ? (
              <Spinner size="sm" />
            ) : (
              <Form.Select value={selectedSession} onChange={handleSessionChange}>
                <option value="">Select session</option>
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

          <Col md={6} className="text-end d-flex justify-content-end gap-2">
  <Button
    variant="success"
    disabled={!selectedSession}
    onClick={handleExport}
  >
    Export
  </Button>

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
                {attendance
                  .filter(a => {
                    const name = `${a.playerId?.firstName || ''} ${a.playerId?.lastName || ''}`.toLowerCase();
                    const matchesSearch = search ? name.includes(search.toLowerCase()) : true;
                    const matchesStatus = status ? a.status === status : true;
                    return matchesSearch && matchesStatus;
                  })
                  .map((a, i) => (
                    <tr key={a._id}>
                      <td>{i + 1}</td>
                      <td>{a.playerId?.firstName} {a.playerId?.lastName}</td>
                      <td>{a.status}</td>
                      <td>{a.remarks || '-'}</td>
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
        onSaved={() => { const id = selectedSession; fetchAttendance(id); fetchSessions(); setSelectedSession(''); setSessions(prev => prev.filter(s => s._id !== id)); }}
      />
    </div>
  );
}
