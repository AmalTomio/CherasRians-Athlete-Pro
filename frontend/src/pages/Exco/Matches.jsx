import React, { useEffect, useState } from "react";
import { Spinner, Alert, Table, Badge } from "react-bootstrap";
import moment from "moment";
import api from "../../api/axios";
import { getSocket } from "../../socket";

export default function ExcoMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH ================= */
  const fetchMatches = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const res = await api.get("/matches/all");
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error("Fetch matches error:", err);
      if (!silent) setError("Failed to fetch matches.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  /* ================= REALTIME ================= */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = () => fetchMatches(true);

    socket.on("dashboard_update", handler);

    return () => {
      socket.off("dashboard_update", handler);
    };
  }, []);

  /* ================= UI ================= */

  return (
    <div className="container-fluid py-4">
      <h2 className="fw-bold mb-3">Matches Overview</h2>

      <div className="card shadow-sm border-0 rounded-4 bg-white">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : error ? (
            <div className="p-4">
              <Alert variant="danger">{error}</Alert>
            </div>
          ) : matches.length === 0 ? (
            <div className="p-5 text-center text-muted">
              No matches found.
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Opponent</th>
                    <th>Sport</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Coach</th>
                    <th>Score</th>
                    <th>Result</th>
                  </tr>
                </thead>

                <tbody>
                  {matches.map((m) => (
                    <tr key={m._id}>
                      <td className="fw-medium">{m.opponent}</td>

                      <td>{m.sport}</td>

                      <td>{m.category}</td>

                      <td>
                        {moment(m.matchDate).format("DD MMM YYYY")}
                      </td>

                      <td>
                        {m.coachId?.firstName}{" "}
                        {m.coachId?.lastName}
                      </td>

                      <td>
                        {m.score
                          ? `${m.score.our} - ${m.score.opponent}`
                          : "-"}
                      </td>

                      <td>
                        <ResultBadge result={m.result} status={m.status} />
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

/* ================= RESULT BADGE ================= */

function ResultBadge({ result, status }) {
  if (status !== "completed") {
    return <Badge bg="secondary">Upcoming</Badge>;
  }

  switch (result) {
    case "win":
      return <Badge bg="success">Win</Badge>;
    case "loss":
      return <Badge bg="danger">Loss</Badge>;
    case "draw":
      return <Badge bg="warning" text="dark">Draw</Badge>;
    default:
      return <Badge bg="secondary">-</Badge>;
  }
}