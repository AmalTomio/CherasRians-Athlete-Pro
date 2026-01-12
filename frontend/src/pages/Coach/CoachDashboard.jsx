import { useMemo } from "react";
import Chart from "react-apexcharts";
import { Card, Row, Col, Badge } from "react-bootstrap";

/**
 * COACH DASHBOARD
 * Dummy but realistic sports analytics data
 * Backend-safe (no API calls)
 */
export default function CoachDashboard() {
  /* =======================
     DUMMY ANALYTICS DATA
  ======================= */

  const kpi = {
    upcomingSessions: 5,
    totalPlayers: 18,
    avgAttendance: 82,
    approvedBookings: 12,
  };

  const sessionByCategory = {
    U15: 7,
    U18: 9,
  };

  const sessionTypes = {
    training: 10,
    tryout: 3,
    event: 2,
  };

  const playerDistribution = {
    U15: 8,
    U18: 10,
  };

  const bookingStatus = {
    approved: 12,
    pending: 2,
    rejected: 1,
  };

  /* =======================
     CHART CONFIGS
  ======================= */

  const donutBase = {
    chart: { type: "donut" },
    legend: { position: "bottom" },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
  };

  const categoryChart = {
    series: [sessionByCategory.U15, sessionByCategory.U18],
    options: {
      ...donutBase,
      labels: ["U-15", "U-18"],
      colors: ["#2563eb", "#22c55e"],
    },
  };

  const sessionTypeChart = {
    series: Object.values(sessionTypes),
    options: {
      ...donutBase,
      labels: ["Training", "Tryout", "Event"],
      colors: ["#6366f1", "#f59e0b", "#14b8a6"],
    },
  };

  const bookingStatusChart = {
    series: Object.values(bookingStatus),
    options: {
      ...donutBase,
      labels: ["Approved", "Pending", "Rejected"],
      colors: ["#22c55e", "#f59e0b", "#ef4444"],
    },
  };

  const playerBarChart = {
    series: [
      {
        name: "Players",
        data: [playerDistribution.U15, playerDistribution.U18],
      },
    ],
    options: {
      chart: { type: "bar" },
      colors: ["#2563eb"],
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: true,
        },
      },
      xaxis: {
        categories: ["U-15", "U-18"],
      },
    },
  };

  /* =======================
     UI
  ======================= */

  return (
    <div className="px-4 py-4 w-100">
      {/* ================= HEADER ================= */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Coach Dashboard</h2>
        <p className="text-muted mb-0">
          Training performance & session overview
        </p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <Row className="g-4 mb-4">
        <KpiCard title="Upcoming Sessions" value={kpi.upcomingSessions} color="#2563eb" />
        <KpiCard title="Total Players" value={kpi.totalPlayers} color="#16a34a" />
        <KpiCard title="Avg Attendance" value={`${kpi.avgAttendance}%`} color="#9333ea" />
        <KpiCard title="Approved Bookings" value={kpi.approvedBookings} color="#f59e0b" />
      </Row>

      {/* ================= CHARTS ================= */}
      <Row className="g-4">
        <Col md={6}>
          <DashboardCard title="Sessions by Category">
            <Chart {...categoryChart} type="donut" height={280} />
          </DashboardCard>
        </Col>

        <Col md={6}>
          <DashboardCard title="Session Type Distribution">
            <Chart {...sessionTypeChart} type="donut" height={280} />
          </DashboardCard>
        </Col>

        <Col md={6}>
          <DashboardCard title="Player Distribution">
            <Chart {...playerBarChart} type="bar" height={260} />
          </DashboardCard>
        </Col>

        <Col md={6}>
          <DashboardCard title="Booking Status Overview">
            <Chart {...bookingStatusChart} type="donut" height={280} />
          </DashboardCard>
        </Col>
      </Row>
    </div>
  );
}

/* =======================
   COMPONENTS
======================= */

function KpiCard({ title, value, color }) {
  return (
    <Col md={3}>
      <Card className="border-0 shadow-sm rounded-4 h-100">
        <Card.Body>
          <div className="text-muted small mb-1">{title}</div>
          <div className="fs-3 fw-bold" style={{ color }}>
            {value}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}

function DashboardCard({ title, children }) {
  return (
    <Card className="border-0 shadow-sm rounded-4 h-100">
      <Card.Body>
        <h6 className="fw-bold mb-3">{title}</h6>
        {children}
      </Card.Body>
    </Card>
  );
}
