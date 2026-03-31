import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, LabelList
} from "recharts";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  FiCalendar, FiUsers, FiActivity, FiInfo,
  FiRefreshCw, FiArrowRight, FiTrendingUp
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
        <div className="spinner-border text-primary mb-3"></div>
        <h5 className="fw-bold">Loading insights...</h5>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-4 w-100">
        <div className="alert alert-danger shadow-sm rounded-4 d-flex gap-3">
          <FiInfo size={24} />
          <div>
            <h6 className="fw-bold mb-1">Error Loading Dashboard</h6>
            <p className="mb-0 small">{error}</p>
          </div>
        </div>
        <button className="btn btn-outline-danger mt-2 fw-bold" onClick={() => fetchData()}>
          <FiRefreshCw className="me-2" /> Try Again
        </button>
      </div>
    );
  }

  const kpi = dashboardData?.kpi || {};
  const categories = dashboardData?.categories || { U15: 0, U18: 0 };
  const attendanceTrend = dashboardData?.attendanceTrend || [];
  const weeklySessions = dashboardData?.weeklySessions || [];

  /* ================= NORMALIZE ATTENDANCE ================= */
  const normalizedAttendance = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const formatted = date.toISOString().split("T")[0];

    const found = attendanceTrend.find(a => a.date === formatted);

    normalizedAttendance.push({
      date: formatted,
      rate: found ? found.rate : 0,
      present: found?.present || 0,
      total: found?.total || 0,
    });
  }

  const weeklyData = weeklySessions.map(w => ({
    name: new Date(w.date).toLocaleDateString("en-US", { weekday: "short" }),
    count: w.count
  }));

  const hasCategoryData = categories.U15 > 0 || categories.U18 > 0;
  const categoryData = hasCategoryData
    ? [
        { name: "U-15 Sessions", value: categories.U15 },
        { name: "U-18 Sessions", value: categories.U18 }
      ]
    : [{ name: "No Data", value: 1 }];

  const categoryColors = hasCategoryData ? ["#3b82f6", "#10b981"] : ["#e5e7eb"];
  const totalCategorySessions = categories.U15 + categories.U18;

  return (
    <div className="px-4 py-4 w-100">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <div>
          <h2 className="fw-bold">Dashboard</h2>
          <p className="text-muted">Overview of your team performance</p>
        </div>
        <button className="btn btn-outline-primary" onClick={() => fetchData(true)}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* KPI */}
      <div className="row g-4 mb-4">
        <KpiCard title="Upcoming Sessions" value={kpi.upcomingSessions || 0} icon={<FiCalendar />} />
        <KpiCard title="Players" value={kpi.totalPlayers || 0} icon={<FiUsers />} />
        <KpiCard title="Avg. Attendance (7d)" value={`${kpi.attendanceRate || 0}%`} icon={<FiActivity />} />
      </div>

      {/* ATTENDANCE */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <DashboardCard title="Attendance Trend" subtitle="Last 7 days" icon={<FiTrendingUp />}>
            <div style={{ height: 320, width: "100%", minHeight: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={normalizedAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip
                    formatter={(val, name, props) => [
                      `${val}%`,
                      `(${props.payload.present}/${props.payload.total})`
                    ]}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#6366f1" fill="#c7d2fe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>

        {/* CATEGORY */}
        <div className="col-lg-4">
          <DashboardCard title="Sessions by Category">
            <div style={{ height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryData} dataKey="value">
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={categoryColors[i]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center fw-bold mt-2">
              Total: {totalCategorySessions}
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* WEEKLY */}
      <DashboardCard title="Sessions (Last 7 Days)">
        <div style={{ height: 280, minHeight: 280 }}>
          <ResponsiveContainer>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <RechartsTooltip />
              <Bar dataKey="count" fill="#8b5cf6">
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function KpiCard({ title, value, icon }) {
  return (
    <div className="col-md-4">
      <div className="card p-3 shadow-sm">
        <div className="d-flex justify-content-between">
          <div>
            <div className="text-muted small">{title}</div>
            <div className="fs-4 fw-bold">{value}</div>
          </div>
          {icon}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, subtitle, icon, children }) {
  return (
    <div className="card p-3 shadow-sm h-100">
      <div className="mb-3">
        <h6 className="fw-bold">{icon} {title}</h6>
        {subtitle && <small className="text-muted">{subtitle}</small>}
      </div>
      {children}
    </div>
  );
}