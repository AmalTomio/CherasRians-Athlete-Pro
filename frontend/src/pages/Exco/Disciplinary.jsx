import React, { useState, useEffect } from "react";
import {
  Spinner,
  Alert,
  Table,
  Form,
  Button,
  Row,
  Col,
} from "react-bootstrap";
import moment from "moment-timezone";
import api from "../../api/axios";
import { getSocket } from "../../socket";
import { errorAlert } from "../../utils/swal";

export default function ExcoDisciplinary() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    sport: "",
    category: "",
  });

  /* ================= FETCH ================= */
  const fetchRecords = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/disciplinary/all");
      const data = res.data.data || [];
      setRecords(data);
      setFiltered(data);
    } catch {
      if (!silent) setError("Failed to fetch disciplinary records.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  /* ================= SOCKET ================= */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => fetchRecords(true);
    socket.on("dashboard_update", handler);
    return () => socket.off("dashboard_update", handler);
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    let data = [...records];

    if (filters.search) {
      data = data.filter((r) =>
        `${r.playerId?.firstName} ${r.playerId?.lastName}`
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      );
    }

    if (filters.sport) {
      data = data.filter((r) => r.sport === filters.sport);
    }

    if (filters.category) {
      data = data.filter((r) => r.category === filters.category);
    }

    setFiltered(data);
  }, [filters, records]);

  /* ================= EXPORT ================= */
  const handleExport = async () => {
    try {
      const res = await api.get("/reports/disciplinary", {
        params: {
          playerName: filters.search,
          sport: filters.sport,
          category: filters.category,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;

      const filename = `disciplinary_${new Date()
        .toISOString()
        .split("T")[0]}.xlsx`;

      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      errorAlert("Failed to export disciplinary report");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="container-fluid py-4">
      <h2 className="fw-bold mb-3">Disciplinary Dashboard</h2>

      {/* FILTER */}
      <Row className="mb-3">
        <Col>
          <Form.Control
            placeholder="Search player..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
          />
        </Col>

        <Col>
          <Form.Select
            value={filters.sport}
            onChange={(e) =>
              setFilters({ ...filters, sport: e.target.value })
            }
          >
            <option value="">All Sports</option>
            <option value="football">Football</option>
            <option value="volleyball">Volleyball</option>
            <option value="netball">Netball</option>
            <option value="sepak_takraw">Sepak Takraw</option>
          </Form.Select>
        </Col>

        <Col>
          <Form.Select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option value="">All Category</option>
            <option value="U-15">U-15</option>
            <option value="U-18">U-18</option>
          </Form.Select>
        </Col>

        <Col className="d-flex justify-content-end">
          <Button variant="success" onClick={handleExport}>
            Export
          </Button>
        </Col>
      </Row>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No disciplinary records found
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Sport</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td>
                      {r.playerId?.firstName} {r.playerId?.lastName}
                    </td>
                    <td>{r.sport}</td>
                    <td>{r.category}</td>
                    <td>{r.type}</td>
                    <td>{r.reason}</td>
                    <td className="text-danger fw-bold">
                      {r.severity}
                    </td>
                    <td>{r.status}</td>
                    <td>
                      {moment(r.createdAt).format("DD MMM YYYY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}