import React, { useState, useEffect } from "react";
import { Spinner, Alert, Dropdown, Table } from "react-bootstrap";
import moment from "moment-timezone";
import api from "../../api/axios";
import { getSocket } from "../../socket";
import Swal from "sweetalert2";

export default function CoachDisciplinary() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/disciplinary/coach");
      setRecords(res.data.data || res.data.records || []);
    } catch (err) {
      if (!silent) setError("Failed to fetch disciplinary records.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => fetchRecords(true);
    socket.on("dashboard_update", handler);
    return () => {
      socket.off("dashboard_update", handler);
    };
  }, []);

  const updateAction = async (id, action) => {
    try {
      await api.patch(`/disciplinary/${id}`, { action });
      Swal.fire("Success", "Action updated successfully", "success");
      fetchRecords(true);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update action", "error");
    }
  };

  const statusColor = (action) => {
    if (action === "suspension") return "danger";
    if (action === "warning") return "warning text-dark";
    return "secondary";
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1 text-dark fw-bold">Disciplinary Records</h2>
        <p className="text-muted mb-0">Manage disciplinary actions for players under your team.</p>
      </div>

      <div className="card shadow-sm border-0 rounded-4 bg-white">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : error ? (
            <div className="p-4"><Alert variant="danger">{error}</Alert></div>
          ) : records.length === 0 ? (
            <div className="p-5 text-center text-muted">No disciplinary records found.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 border-0">Player</th>
                    <th className="px-4 py-3 border-0">Reason</th>
                    <th className="px-4 py-3 border-0">Reported Date</th>
                    <th className="px-4 py-3 border-0">Current Action</th>
                    <th className="px-4 py-3 border-0">Update Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r._id}>
                      <td className="px-4 fw-medium">
                        {r.player?.firstName} {r.player?.lastName}
                      </td>
                      <td className="px-4">{r.reason}</td>
                      <td className="px-4 text-muted">
                        {moment(r.createdAt).format("DD MMM YYYY")}
                      </td>
                      <td className="px-4">
                        <span className={`badge bg-${statusColor(r.action)}`}>
                          {r.action ? r.action.toUpperCase() : "NONE"}
                        </span>
                      </td>
                      <td className="px-4">
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${r._id}`}>
                            Set Action
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => updateAction(r._id, "none")}>None</Dropdown.Item>
                            <Dropdown.Item onClick={() => updateAction(r._id, "warning")}>Warning</Dropdown.Item>
                            <Dropdown.Item onClick={() => updateAction(r._id, "suspension")}>Suspension</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
