// src/pages/Exco/ExcoDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Chart from "../../components/Chart";
import "./ExcoDashboard.css";
import moment from "moment";

export default function ExcoDashboard() {
  const [stats, setStats] = useState([]);
  const [bookingStats, setBookingStats] = useState([]);
  const [trendStats, setTrendStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sports");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sportRes, bookingRes, trendRes, pendingRes, announcementRes] = await Promise.all([
        api.get("/exco/stats/sports"),
        api.get("/exco/stats/bookings"),
        api.get("/exco/stats/trends"),
        api.get("/exco/bookings/pending"),
        api.get("/announcements"),
      ]);
      setStats(sportRes.data.stats || []);
      setBookingStats(bookingRes.data.stats || []);
      setTrendStats(trendRes.data.stats || []);
      setRecentBookings(pendingRes.data.bookings ? pendingRes.data.bookings.slice(0, 5) : []); // get top 5 pending
      setAnnouncements(announcementRes.data.announcements ? announcementRes.data.announcements.slice(0, 5) : []);
    } catch (err) {
      console.error("Failed to load Exco dashboard data:", err);
      setStats([]);
      setBookingStats([]);
      setTrendStats([]);
      setRecentBookings([]);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate some aggregate stats for KPI cards
  const totalAthletes = stats.reduce((sum, s) => sum + s.count, 0);
  const pendingBookings = bookingStats.find((s) => s.status === "pending")?.count || 0;
  const approvedBookings = bookingStats.find((s) => s.status === "approved")?.count || 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="dashboard-container">
      {/* Hero Banner */}
      <div className="hero-banner mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1 text-white" style={{ letterSpacing: "-0.5px" }}>
              {getGreeting()}, Exco Member! 👋
            </h2>
            <p className="text-white-50 mb-0">
              Here is what's happening today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="container-fluid px-0">
        {/* KPI Cards */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <div className="kpi-card card border-0 p-4 h-100 shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="kpi-label mb-1">Total Athletes</p>
                  <h3 className="kpi-value mb-0">{loading ? "..." : totalAthletes}</h3>
                </div>
                <div className="kpi-icon-wrapper bg-primary-subtle text-primary">
                  <i className="bi bi-people-fill"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="kpi-card card border-0 p-4 h-100 shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="kpi-label mb-1">Pending Bookings</p>
                  <h3 className="kpi-value mb-0">{loading ? "..." : pendingBookings}</h3>
                </div>
                <div className="kpi-icon-wrapper bg-warning-subtle text-warning">
                  <i className="bi bi-hourglass-split"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="kpi-card card border-0 p-4 h-100 shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="kpi-label mb-1">Approved Bookings</p>
                  <h3 className="kpi-value mb-0">{loading ? "..." : approvedBookings}</h3>
                </div>
                <div className="kpi-icon-wrapper bg-success-subtle text-success">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Interactive Section */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-xl-8">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                <ul className="nav nav-tabs card-header-tabs custom-tabs border-0">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'sports' ? 'active' : ''}`}
                      onClick={() => setActiveTab('sports')}
                    >
                      <i className="bi bi-pie-chart-fill me-2"></i> Sports Overview
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
                      onClick={() => setActiveTab('bookings')}
                    >
                      <i className="bi bi-bar-chart-fill me-2"></i> Booking Stages
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'trends' ? 'active' : ''}`}
                      onClick={() => setActiveTab('trends')}
                    >
                      <i className="bi bi-graph-up me-2"></i> Trends
                    </button>
                  </li>
                </ul>
              </div>
              <div className="card-body p-4 pt-4">
                {activeTab === 'sports' && (
                  <Chart 
                    stats={stats} 
                    type="donut" 
                    title="Students Per Sport" 
                    tooltipLabel="students"
                    colors={["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"]}
                  />
                )}
                {activeTab === 'bookings' && (
                  <Chart 
                    stats={bookingStats} 
                    type="bar" 
                    title="Booking Status Overview" 
                    tooltipLabel="bookings"
                    colors={["#8b5cf6", "#ec4899", "#f43f5e", "#10b981", "#3b82f6"]}
                  />
                )}
                {activeTab === 'trends' && (
                  <Chart 
                    stats={trendStats} 
                    type="line" 
                    title="Monthly Booking Trends" 
                    tooltipLabel="bookings"
                    colors={["#f43f5e", "#8b5cf6", "#10b981", "#3b82f6", "#f59e0b"]}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card shadow-sm border-0 h-100 action-widget text-white p-4 d-flex flex-column justify-content-between">
              <div>
                <h4 className="fw-bold mb-3 mt-2">Quick Actions</h4>
                <p className="opacity-75">Manage incoming facility booking requests efficiently.</p>
              </div>
              <div className="mt-4">
                <Link to="/exco/booking" className="btn btn-light w-100 py-3 fw-bold mb-3 action-btn d-flex justify-content-between align-items-center text-decoration-none">
                  Review New Bookings
                  <span className="badge bg-danger rounded-pill">{pendingBookings}</span>
                </Link>
                <Link to="/exco/booking" className="btn btn-outline-light w-100 py-3 fw-bold action-btn text-decoration-none">
                  View Full History
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Widgets */}
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 p-4 h-100 widget-card">
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h5 className="fw-bold text-dark mb-0">Recent Booking Requests</h5>
                <Link to="/exco/booking" className="text-decoration-none small fw-semibold">View All</Link>
              </div>
              <div className="d-flex flex-column gap-3">
                {recentBookings.length === 0 ? (
                  <p className="text-muted text-center my-4">No pending requests.</p>
                ) : (
                  recentBookings.map((booking) => (
                    <div key={booking._id} className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 list-item-hover">
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, fontWeight: "bold", fontSize: "1.2rem" }}>
                          <i className="bi bi-calendar2-check"></i>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-semibold text-dark">{booking.facilityId?.name || "Facility"}</h6>
                          <small className="text-muted">
                            {booking.coachId?.firstName} {booking.coachId?.lastName} • {moment(booking.createdAt).fromNow()}
                          </small>
                        </div>
                      </div>
                      <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-pill">
                        {booking.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 p-4 h-100 widget-card">
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h5 className="fw-bold text-dark mb-0">Announcements</h5>
                <Link to="/exco/announcements" className="text-decoration-none small fw-semibold">View All</Link>
              </div>
              <div className="d-flex flex-column gap-3 position-relative timeline-container px-2">
                {announcements.length === 0 ? (
                  <p className="text-muted text-center my-4">No recent announcements.</p>
                ) : (
                  announcements.map((announcement, i) => {
                    const colors = ["primary", "success", "info", "warning", "danger"];
                    const color = colors[i % colors.length];
                    return (
                      <div key={announcement._id} className="d-flex gap-4 position-relative z-1 timeline-item">
                        <div className="d-flex flex-column align-items-center">
                          <div className={`rounded-circle bg-${color} mt-1`} style={{ width: 14, height: 14 }}></div>
                          {i < announcements.length - 1 && <div className="bg-secondary opacity-25 flex-grow-1 mt-2" style={{ width: 2, minHeight: 40 }}></div>}
                        </div>
                        <div className="pb-3 w-100">
                          <h6 className="mb-1 fw-bold text-dark">{announcement.title}</h6>
                          <p className="mb-1 small text-muted text-truncate" style={{ maxWidth: '350px' }}>{announcement.content}</p>
                          <small className="text-muted">{moment(announcement.createdAt).format("MMM D, YYYY")}</small>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
