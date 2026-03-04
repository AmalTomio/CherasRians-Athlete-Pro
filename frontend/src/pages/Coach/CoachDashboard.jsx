import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { 
  FiCalendar, 
  FiUsers, 
  FiActivity, 
  FiClock, 
  FiInfo, 
  FiRefreshCw,
  FiArrowRight,
  FiTrendingUp
} from "react-icons/fi";

export default function CoachDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get("/coach/dashboard");
      setDashboardData(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center w-100 text-muted" style={{ minHeight: "70vh" }}>
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <h5 className="fw-bold">Loading insights...</h5>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-4 w-100">
        <div className="alert alert-danger border-0 shadow-sm rounded-4 d-flex align-items-center gap-3">
          <FiInfo size={24} /> 
          <div>
            <h6 className="fw-bold mb-1">Error Loading Dashboard</h6>
            <p className="mb-0 small">{error}</p>
          </div>
        </div>
        <button className="btn btn-outline-danger mt-2 fw-bold" onClick={() => fetchData()}>
          <FiRefreshCw className="me-2"/> Try Again
        </button>
      </div>
    );
  }

  // Exact data mappings from backend
  const kpi = dashboardData?.kpi || {
    upcomingSessions: 0,
    totalPlayers: 0,
    attendanceRate: 0,
    pendingBookings: 0,
  };

  // Note: Backend returns session counts by category (U15 vs U18)
  const categories = dashboardData?.categories || { U15: 0, U18: 0 };
  const attendanceTrend = dashboardData?.attendanceTrend || [];
  const weeklySessions = dashboardData?.weeklySessions || [];

  /* =======================
     CHART CONFIGS
  ======================= */

  // 1. Attendance Trend (Last 30 Days)
  const attendanceTrendChart = {
    series: [{ name: "Attendance Rate", data: attendanceTrend.map((a) => a.rate) }],
    options: {
      chart: { 
        type: "area", 
        toolbar: { show: false },
        fontFamily: 'inherit',
        zoom: { enabled: false }
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] }
      },
      xaxis: { 
        categories: attendanceTrend.map((a) => a.date),
        labels: { 
          style: { colors: "#64748b" },
          formatter: (value) => {
            if (!value) return "";
            const d = new Date(value);
            return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
          }
        },
        tooltip: { enabled: false },
        axisBorder: { show: false }
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: { formatter: (val) => `${val}%`, style: { colors: "#64748b", fontWeight: 500 } }
      },
      colors: ["#6366f1"],
      markers: { 
        size: 0, hover: { size: 6, colors: ["#fff"], strokeColors: "#6366f1", strokeWidth: 3 }
      },
      tooltip: {
        theme: "light",
        y: { formatter: (val) => `${val}% Attendance` }
      }
    },
  };

  // 2. Weekly Sessions (Last 7 Days)
  const weeklySessionsChart = {
    series: [{ name: "Sessions", data: weeklySessions.map((w) => w.count) }],
    options: {
      chart: { type: "bar", toolbar: { show: false }, fontFamily: 'inherit' },
      plotOptions: { 
        bar: { 
          borderRadius: 6, 
          columnWidth: '40%',
          dataLabels: { position: 'top' }
        } 
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => val > 0 ? val : "",
        offsetY: -20,
        style: { fontSize: '12px', colors: ["#475569"], fontWeight: 600 }
      },
      xaxis: { 
        categories: weeklySessions.map((w) => {
          const d = new Date(w.date);
          return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${d.getDate()}`;
        }),
        labels: { style: { colors: "#64748b", fontWeight: 500 } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { show: false },
      grid: { show: false, padding: { top: 20, right: 0, bottom: 0, left: 0 } },
      colors: ["#8b5cf6"],
      tooltip: {
        theme: "light",
        y: { formatter: (val) => `${val} Session(s)` }
      }
    },
  };

  // 3. Approved Sessions by Category (Donut)
  const hasCategoryData = categories.U15 > 0 || categories.U18 > 0;
  const categoryChart = {
    series: hasCategoryData ? [categories.U15, categories.U18] : [1],
    options: {
      chart: { type: "donut", fontFamily: 'inherit' },
      labels: hasCategoryData ? ["U-15 Sessions", "U-18 Sessions"] : ["No Data"],
      colors: hasCategoryData ? ["#3b82f6", "#10b981"] : ["#f1f5f9"],
      legend: { position: "bottom", markers: { radius: 12 }, fontWeight: 500, itemMargin: { horizontal: 10, vertical: 10 } },
      stroke: { width: 3, colors: ['#fff'] },
      dataLabels: { enabled: false },
      tooltip: { enabled: hasCategoryData, theme: "light" },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '78%',
            labels: {
              show: true,
              name: { show: true, color: "#64748b", fontSize: "14px" },
              value: { show: true, fontSize: '28px', fontWeight: 800, color: "#0f172a" },
              total: {
                show: true,
                showAlways: true,
                label: 'Total Sessions',
                formatter: function (w) {
                  return hasCategoryData ? w.globals.seriesTotals.reduce((a, b) => a + b, 0) : 0;
                }
              }
            }
          }
        }
      }
    },
  };

  /* =======================
     UI RENDER
  ======================= */
  return (
    <div className="px-4 py-4 w-100">
      {/* ================= HEADER ================= */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 text-dark" style={{ letterSpacing: "-0.5px" }}>Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome back! Here is what's happening with your team.
          </p>
        </div>
        
        <button 
          className="btn btn-white border shadow-sm fw-bold d-flex align-items-center gap-2 px-3 py-2 text-secondary"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          style={{ borderRadius: "10px" }}
        >
          <FiRefreshCw className={refreshing ? "spin-animation text-primary" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* ================= INTERACTIVE KPI CARDS ================= */}
      <div className="row g-4 mb-4">
        <KpiCard 
          title="Upcoming Sessions" 
          value={kpi.upcomingSessions} 
          icon={<FiCalendar size={24} />} 
          color="#3b82f6" 
          bg="#eff6ff"
          onClick={() => navigate("/coach/schedule")}
        />
        <KpiCard 
          title="Total Active Players" 
          value={kpi.totalPlayers} 
          icon={<FiUsers size={24} />} 
          color="#10b981" 
          bg="#ecfdf5" 
          onClick={() => navigate("/coach/players")}
        />
        <KpiCard 
          title="Avg. Attendance (30d)" 
          value={`${kpi.attendanceRate}%`} 
          icon={<FiActivity size={24} />} 
          color="#6366f1" 
          bg="#e0e7ff" 
          onClick={() => navigate("/coach/attendance")}
        />
        <KpiCard 
          title="Pending Bookings" 
          value={kpi.pendingBookings} 
          icon={<FiClock size={24} />} 
          color="#f59e0b" 
          bg="#fef3c7" 
          onClick={() => navigate("/coach/booking")}
        />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="row g-4 mb-4">
        {/* Left: Attendance Trend */}
        <div className="col-xl-8">
          <DashboardCard 
            title="Attendance Trend" 
            subtitle="Percentage of players present over the last 30 days"
            icon={<FiTrendingUp className="text-primary" />}
            action={
              <button className="btn btn-sm text-primary fw-bold p-0 d-flex align-items-center gap-1 text-decoration-none" onClick={() => navigate("/coach/attendance")}>
                View Log <FiArrowRight />
              </button>
            }
          >
            {attendanceTrend.length === 0 ? (
              <EmptyChartState message="Not enough attendance data recorded yet." />
            ) : (
              <Chart {...attendanceTrendChart} type="area" height={320} />
            )}
          </DashboardCard>
        </div>

        {/* Right: Category Distribution */}
        <div className="col-xl-4">
          <DashboardCard 
            title="Approved Sessions" 
            subtitle="Breakdown by team category"
          >
            <div className="d-flex align-items-center justify-content-center h-100 pb-3" style={{ minHeight: "320px" }}>
              <Chart {...categoryChart} type="donut" width="100%" />
            </div>
          </DashboardCard>
        </div>
      </div>

      <div className="row g-4">
        {/* Bottom: Weekly Sessions */}
        <div className="col-12">
          <DashboardCard 
            title="Sessions Breakdown" 
            subtitle="Number of approved sessions over the past 7 days"
          >
            {weeklySessions.every(w => w.count === 0) ? (
              <EmptyChartState message="No sessions recorded in the past 7 days." />
            ) : (
              <Chart {...weeklySessionsChart} type="bar" height={280} />
            )}
          </DashboardCard>
        </div>
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hover-card { transition: all 0.2s ease-in-out; }
        .hover-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important; }
      `}</style>
    </div>
  );
}

/* =======================
   REUSABLE COMPONENTS
======================= */

function KpiCard({ title, value, icon, color, bg, onClick }) {
  return (
    <div className="col-md-6 col-lg-3">
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        style={{ cursor: "pointer", height: "100%" }}
      >
        <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-card">
          <div className="card-body p-4 d-flex justify-content-between align-items-center gap-3">
            <div>
              <div className="text-muted small fw-bold mb-1 text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                {title}
              </div>
              <div className="fs-3 fw-bolder text-dark lh-1 mb-2">
                {value}
              </div>
              <span className="text-primary small fw-bold d-flex align-items-center gap-1" style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                Manage <FiArrowRight size={12}/>
              </span>
            </div>
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: "56px", height: "56px", backgroundColor: bg, color: color }}
            >
              {icon}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DashboardCard({ title, subtitle, icon, action, children }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              {icon} {title}
            </h5>
            {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
        <div className="flex-grow-1 w-100">
          {children}
        </div>
      </div>
    </div>
  );
}

function EmptyChartState({ message }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100 bg-light rounded-4 border border-dashed" style={{ minHeight: "250px" }}>
      <FiInfo size={32} className="mb-2 opacity-50" />
      <span className="small fw-medium">{message}</span>
    </div>
  );
}