import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, Row, Col, Spinner, Table, Badge } from "react-bootstrap";
import moment from "moment";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getSocket } from "../../socket";

export default function Performance() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const res = await api.get("/performance/student");
      setStats(res.data?.stats || []);
    } catch (err) {
      console.error("Performance fetch error", err);
      setStats([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= REAL-TIME ================= */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = () => fetchData(true);

    socket.off("dashboard_update");
    socket.on("dashboard_update", handler);

    return () => socket.off("dashboard_update", handler);
  }, []);

  /* ================= KPI ================= */
  const totalMatches = stats.length;

  const avgRating =
    totalMatches > 0
      ? (
          stats.reduce((sum, s) => sum + (s.rating || 0), 0) / totalMatches
        ).toFixed(2)
      : 0;

  const totalMinutes = stats.reduce(
    (sum, s) => sum + (s.minutesPlayed || 0),
    0
  );

  /* ================= CHART DATA ================= */
  const chartData = stats.map((s) => ({
    date: moment(s.matchId?.matchDate).format("DD MMM"),
    rating: s.rating || 0,
  }));

  /* ================= STATUS BADGE ================= */
  const getResultColor = (result) => {
    if (result === "win") return "success";
    if (result === "loss") return "danger";
    return "secondary";
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <h3 className="fw-bold mb-4">My Performance</h3>

      {/* KPI */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <h6>Total Matches</h6>
            <h4>{totalMatches}</h4>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <h6>Average Rating</h6>
            <h4>{avgRating}</h4>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <h6>Total Minutes</h6>
            <h4>{totalMinutes}</h4>
          </Card>
        </Col>
      </Row>

      {/* CHART */}
      <Card className="mb-4 p-3 shadow-sm">
        <h6 className="fw-bold mb-3">Performance Trend</h6>

        {chartData.length === 0 ? (
          <div className="text-muted">No performance data</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* TABLE */}
      <Card className="p-3 shadow-sm">
        <h6 className="fw-bold mb-3">Match Performance</h6>

        {stats.length === 0 ? (
          <div className="text-muted">No match records</div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Opponent</th>
                <th>Minutes</th>
                <th>Rating</th>
                <th>Result</th>
              </tr>
            </thead>

            <tbody>
              {stats.map((s) => (
                <tr key={s._id}>
                  <td>
                    {moment(s.matchId?.matchDate).format("DD MMM YYYY")}
                  </td>

                  <td>{s.matchId?.opponent || "-"}</td>

                  <td>{s.minutesPlayed || 0}</td>

                  <td>{s.rating || 0}</td>

                  <td>
                    <Badge bg={getResultColor(s.matchId?.result)}>
                      {s.matchId?.result || "-"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}