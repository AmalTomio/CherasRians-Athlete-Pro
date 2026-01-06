import { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Spinner } from "react-bootstrap";
import api from "../api/axios";
import { successAlert, errorAlert } from "../utils/swal";

export default function MarkAttendanceModal({
  show,
  onHide,
  bookingId,
  onSaved,
}) {
  const [players, setPlayers] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show && bookingId) {
      fetchPlayers();
    }
  }, [show, bookingId]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/session/${bookingId}/players`);

      const initial = res.data.players.map((p) => ({
        playerId: p._id,
        name: `${p.firstName} ${p.lastName}`,
        status: "Present",
        remarks: "",
      }));

      setPlayers(initial);
      setRecords(initial);
    } catch {
      errorAlert("Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = (index, field, value) => {
    const updated = [...records];
    updated[index][field] = value;
    setRecords(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await api.post("/attendance/mark", {
        bookingId,
        records: records.map((r) => ({
          playerId: r.playerId,
          status: r.status,
          remarks: r.remarks,
        })),
      });

      successAlert("Attendance saved");
      onHide(); // ✅ CLOSE MODAL
      onSaved(); // refresh table
    } catch {
      errorAlert("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={true}
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Mark Attendance</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner />
          </div>
        ) : (
          <Table bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Class</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.playerId}>
                  <td>{i + 1}</td>
                  <td>{r.name}</td>
                  <td>{r.classGroup || "-"}</td>{" "}
                  <td>
                    <Form.Select
                      value={r.status}
                      onChange={(e) =>
                        updateRecord(i, "status", e.target.value)
                      }
                    >
                      <option>Present</option>
                      <option>Late</option>
                      <option>Absent</option>
                      <option>Injured</option>
                      <option>Excused</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control
                      placeholder="Remarks"
                      value={r.remarks}
                      onChange={(e) =>
                        updateRecord(i, "remarks", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Attendance"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
