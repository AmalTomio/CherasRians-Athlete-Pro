import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Badge } from "react-bootstrap";
import moment from "moment";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FiActivity, FiClock, FiStar, FiCalendar, FiTrendingUp } from "react-icons/fi";

import api from "../../api/axios";
import { getSocket } from "../../socket";
import HeroBanner from "../../components/HeroBanner";

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
  const getResultBadge = (result) => {
    const res = (result || "TBD").toLowerCase();
    if (res === "win") return <Badge bg="success" className="bg-opacity-10 text-success border border-success px-3 py-2 rounded-pill">Win</Badge>;
    if (res === "loss") return <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger px-3 py-2 rounded-pill">Loss</Badge>;
    if (res === "draw") return <Badge bg="warning" className="bg-opacity-10 text-warning border border-warning px-3 py-2 rounded-pill">Draw</Badge>;
    
    return <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary px-3 py-2 rounded-pill text-capitalize">{res}</Badge>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      
      {/* Uniquely scoped CSS to prevent sidebar leakage */}
      <style>{`
        .perf-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .perf-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .perf-tracking-wide {
          letter-spacing: 0.5px;
        }
      `}</style>

      <HeroBanner 
        title="My Performance" 
        subtitle="Track your match ratings, playtime, and overall progress."
      />

      {/* ================= KPI SECTION ================= */}
      <Row className="g-4 mt-2 mb-4">
        <Col md={4}>
          <div className="perf-card p-4 d-flex align-items-center gap-3 h-100">
            <div className="perf-icon-box bg-primary bg-opacity-10 text-primary">
              <FiActivity size={26} />
            </div>
            <div>
              <div className="text-muted small fw-semibold text-uppercase perf-tracking-wide mb-1">Total Matches</div>
              <h3 className="fw-bolder mb-0 text-dark">{totalMatches}</h3>
            </div>
          </div>
        </Col>

        <Col md={4}>
          <div className="perf-card p-4 d-flex align-items-center gap-3 h-100">
            <div className="perf-icon-box bg-warning bg-opacity-10 text-warning">
              <FiStar size={26} />
            </div>
            <div>
              <div className="text-muted small fw-semibold text-uppercase perf-tracking-wide mb-1">Avg Rating</div>
              <h3 className="fw-bolder mb-0 text-dark">{avgRating} <span className="fs-6 text-muted fw-normal">/ 10</span></h3>
            </div>
          </div>
        </Col>

        <Col md={4}>
          <div className="perf-card p-4 d-flex align-items-center gap-3 h-100">
            <div className="perf-icon-box bg-success bg-opacity-10 text-success">
              <FiClock size={26} />
            </div>
            <div>
              <div className="text-muted small fw-semibold text-uppercase perf-tracking-wide mb-1">Minutes Played</div>
              <h3 className="fw-bolder mb-0 text-dark">{totalMinutes} <span className="fs-6 text-muted fw-normal">min</span></h3>
            </div>
          </div>
        </Col>
      </Row>

      {/* ================= CHART SECTION ================= */}
      <Card className="perf-card mb-4 p-2 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <FiTrendingUp className="text-primary fs-5" />
          <h5 className="fw-bold mb-0 text-dark">Performance Trend</h5>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FiActivity className="fs-1 mb-3 text-light" />
            <p className="mb-0">No performance data available yet.</p>
          </div>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  domain={[0, 10]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#114232', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#114232" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                  activeDot={{ r: 6, fill: '#e87b1e', stroke: '#fff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ================= TABLE SECTION ================= */}
      <Card className="perf-card p-0 overflow-hidden">
        <div className="px-4 py-4 border-bottom d-flex align-items-center gap-2">
          <FiCalendar className="text-primary fs-5" />
          <h5 className="fw-bold mb-0 text-dark">Match Records</h5>
        </div>

        {stats.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p className="mb-0">No match records found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small text-uppercase perf-tracking-wide">
                <tr>
                  <th className="ps-4 py-3 fw-bold border-bottom-0">Date</th>
                  <th className="py-3 fw-bold border-bottom-0">Opponent</th>
                  <th className="py-3 fw-bold border-bottom-0">Minutes</th>
                  <th className="py-3 fw-bold border-bottom-0">Rating</th>
                  <th className="pe-4 py-3 fw-bold border-bottom-0 text-end">Result</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s._id} className="border-bottom">
                    <td className="ps-4 py-3 text-secondary fw-medium">
                      {moment(s.matchId?.matchDate).format("DD MMM YYYY")}
                    </td>
                    <td className="py-3 fw-bold text-dark">
                      {s.matchId?.opponent || "Unknown"}
                    </td>
                    <td className="py-3 fw-medium text-secondary">
                      {s.minutesPlayed || 0} <span className="small text-muted">min</span>
                    </td>
                    <td className="py-3 fw-bold text-dark">
                      <FiStar className="text-warning me-1 mb-1" />
                      {s.rating || 0}
                    </td>
                    <td className="pe-4 py-3 text-end">
                      {getResultBadge(s.matchId?.result)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}