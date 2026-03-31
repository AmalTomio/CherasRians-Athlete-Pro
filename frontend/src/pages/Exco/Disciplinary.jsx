import React, { useState, useEffect } from "react";
import { Spinner, Alert, Table } from "react-bootstrap";
import moment from "moment-timezone";
import api from "../../api/axios";
import { getSocket } from "../../socket";

export default function ExcoDisciplinary() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/disciplinary/exco");
      setRecords(res.data.data || res.data.records || []);
    } catch (err) {
      if (!silent) setError("Failed to fetch disciplinary records.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
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

  const statusColor = (action) => {
    if (action === "suspension") return "danger";
    if (action === "warning") return "warning text-dark";
    return "secondary";
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1 text-dark fw-bold">System Disciplinary Overview</h2>
        <p className="text-muted mb-0">View all disciplinary actions submitted by coaches.</p>
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
                    <th className="px-4 py-3 border-0">Action</th>
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
