import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { getSocket } from "../../socket";
import api from "../../api/axios";

import {
  FiCalendar,
  FiUsers,
  FiActivity,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";

export default function CoachDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();


  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await api.get("/coach/dashboard");
      setData(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = () => {
      fetchData(true);
    };

    socket.on("dashboard_update", handler);

    return () => {
      socket.off("dashboard_update", handler);
    };
  }, []);

  /* ================= STATES ================= */

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );

  if (error)
    return (
      <Alert variant="danger" className="m-4">
        {error}
      </Alert>
    );

  const {
    kpi = {},
    categories = { U15: 0, U18: 0 },
    todaySession,
    attendanceTrend = [],
    recentAnnouncements = [],
  } = data || {};

  /* ================= CHART CONFIG ================= */

  const categoryChart = {
    series: [
      {
        name: "Players",
        data: [categories.U15 || 0, categories.U18 || 0],
      },
    ],
    options: {
      chart: { type: "bar", toolbar: { show: false } },
      xaxis: { categories: ["U-15", "U-18"] },
      dataLabels: { enabled: true },
      colors: ["#3b82f6"],
    },
  };

  const attendanceChart = {
    series: [
      {
        name: "Attendance %",
        data: attendanceTrend.map((a) => a.rate),
      },
    ],
    options: {
      chart: { type: "area", toolbar: { show: false } },
      xaxis: {
        categories: attendanceTrend.map((a) => a.date),
      },
      yaxis: { max: 100 },
      stroke: { curve: "smooth" },
      dataLabels: { enabled: false },
      colors: ["#6366f1"],
    },
  };

  /* ================= RENDER ================= */

  return (
    <div className="px-4 py-4 w-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0">Coach Dashboard</h4>
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <FiRefreshCw className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* TODAY SESSION */}
      {todaySession && (
        <Card className="mb-4 p-4 shadow-sm border-0 bg-primary-subtle">
          <h6 className="text-primary fw-bold">Today’s Session</h6>
          <div className="fw-semibold">{todaySession.title}</div>
          <small>{todaySession.facilityId?.name}</small>
        </Card>
      )}

      {/* KPI */}
      <Row className="g-4 mb-4">
        <Kpi
          title="Upcoming Sessions"
          value={kpi.upcomingSessions || 0}
          icon={<FiCalendar />}
        />
        <Kpi
          title="Total Players"
          value={kpi.totalPlayers || 0}
          icon={<FiUsers />}
        />
        <Kpi
          title="Attendance Rate"
          value={`${kpi.attendanceRate || 0}%`}
          icon={<FiActivity />}
        />
        <Kpi
          title="Injured Players"
          value={kpi.injuryCount || 0}
          icon={<FiAlertTriangle />}
        />
      </Row>

      {/* CHARTS */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="p-4 shadow-sm border-0">
            <h6 className="fw-bold mb-3">Player Categories</h6>
            <Chart {...categoryChart} type="bar" height={300} />
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="p-4 shadow-sm border-0">
            <h6 className="fw-bold mb-3">Attendance Trend (30 Days)</h6>
            {attendanceTrend.length === 0 ? (
              <div className="text-muted text-center py-4">
                No attendance data
              </div>
            ) : (
              <Chart {...attendanceChart} type="area" height={300} />
            )}
          </Card>
        </Col>
      </Row>

      {/* ANNOUNCEMENTS */}
      <Card className="p-4 shadow-sm border-0">
        <h6 className="fw-bold mb-3">Recent Announcements</h6>

        {recentAnnouncements.length === 0 ? (
          <div className="text-muted">No announcements available</div>
        ) : (
          recentAnnouncements.map((a) => (
            <div key={a._id} className="mb-3 border-bottom pb-2">
              <div className="fw-semibold">{a.title}</div>
              <small className="text-muted">{a.message}</small>
            </div>
          ))
        )}
      </Card>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function Kpi({ title, value, icon }) {
  return (
    <Col md={6} lg={3}>
      <Card className="p-4 shadow-sm border-0 h-100">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="small text-muted">{title}</div>
            <div className="fw-bold fs-4">{value}</div>
          </div>
          <div className="fs-4 text-primary">{icon}</div>
        </div>
      </Card>
    </Col>
  );
}