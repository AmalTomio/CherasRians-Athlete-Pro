import React, { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { initSocket, getSocket } from "../../socket";
import moment from "moment";
import {
  FiCalendar, FiUsers, FiActivity, FiRefreshCw,
  FiCheckSquare, FiPlus, FiAlertCircle, FiFileText,
  FiClock, FiMapPin, FiFlag, FiChevronRight, FiBell
} from "react-icons/fi";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import HeroBanner from "../../components/HeroBanner";
import { coachService } from "../../services/coachServices";

export default function CoachDashboard() {
  const queryClient = useQueryClient();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const firstName = user.firstName || "Coach";
  const [activeTab, setActiveTab] = useState("training");

  /* ================= DATA ================= */
  const { data: dashboardData = {}, isLoading: loadingDashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: coachService.getDashboard,
  });

  const { data: leaves = [], isLoading: loadingLeaves } = useQuery({
    queryKey: ["leaves"],
    queryFn: coachService.getPendingLeaves,
  });

  const { data: announcements = [], isLoading: loadingAnnouncements } = useQuery({
    queryKey: ["announcements"],
    queryFn: coachService.getAnnouncements,
  });

  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ["schedules"],
    queryFn: coachService.getSchedules,
  });

  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ["matches"],
    queryFn: coachService.getMatches,
  });

  /* ================= SOCKET ================= */
  useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  const handler = () => {
    console.log("⚡ REAL-TIME UPDATE RECEIVED");

    queryClient.invalidateQueries(["dashboard"]);
    queryClient.invalidateQueries(["matches"]);
    queryClient.invalidateQueries(["schedules"]);
    queryClient.invalidateQueries(["leaves"]);
    queryClient.invalidateQueries(["announcements"]);
  };

  socket.off("dashboard_update"); // prevent duplicate listeners
  socket.on("dashboard_update", handler);

  return () => {
    socket.off("dashboard_update", handler);
  };
}, [queryClient]);

  if (loadingDashboard || loadingLeaves || loadingAnnouncements || loadingSchedules || loadingMatches) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

const today = new Date();
today.setHours(0, 0, 0, 0);

  const upcomingMatches = matches
  .filter(m => {
    const matchDate = new Date(m.matchDate);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate >= today && m.status !== "completed";
  })
  .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate))
  .slice(0, 5);

 const upcomingTraining = schedules
  .filter(s => {
    const sessionDate = new Date(s.startAt);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate >= today;
  })
  .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
  .slice(0, 5);

  const topLeaves = leaves.slice(0, 5);
  const topAnnouncements = announcements.slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="container-fluid px-4 py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HERO SECTION */}
      <div className="mb-4">
        <HeroBanner
          title={`${getGreeting()}, Coach ${firstName}`}
          subtitle={`Your squad overview for ${moment().format("dddd, MMMM Do")}.`}
          buttonText="Sync Data"
          buttonIcon={FiRefreshCw}
          onButtonClick={() => queryClient.invalidateQueries()}
        />
      </div>

      <div className="row g-4">
        {/* MAIN FEED: TRAINING & MATCHES */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <div className="nav nav-pills card-header-pills">
                <button
                  className={`nav-link border-0 rounded-pill px-4 me-2 ${activeTab === "training" ? "active bg-primary" : "text-muted"}`}
                  onClick={() => setActiveTab("training")}
                >
                  <FiActivity className="me-2" /> Training
                </button>
                <button
                  className={`nav-link border-0 rounded-pill px-4 ${activeTab === "matches" ? "active bg-primary" : "text-muted"}`}
                  onClick={() => setActiveTab("matches")}
                >
                  <FiFlag className="me-2" /> Matches
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {activeTab === "training" ? (
                  upcomingTraining.length === 0 ? (
                    <div className="p-5 text-center text-muted">No scheduled training found</div>
                  ) : (
                    upcomingTraining.map(t => (
                      <div key={t._id} className="list-group-item list-group-item-action border-0 p-4 d-flex align-items-center">
                        <div className="bg-light-primary rounded-3 p-3 me-4 text-primary d-none d-md-block">
                          <FiCalendar size={24} />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold text-dark">{t.title || "Regular Training Session"}</h6>
                          <div className="d-flex flex-wrap gap-3 text-muted small">
                            <span><FiClock className="me-1" /> {t.startTime} - {t.endTime}</span>
                            <span><FiCalendar className="me-1" /> {moment(t.startAt).format("DD MMM YYYY")}</span>
                          </div>
                        </div>
                        <FiChevronRight className="text-muted" />
                      </div>
                    ))
                  )
                ) : (
                  upcomingMatches.length === 0 ? (
                    <div className="p-5 text-center text-muted">No upcoming matches scheduled</div>
                  ) : (
                    upcomingMatches.map(m => (
                      <div key={m._id} className="list-group-item list-group-item-action border-0 p-4 d-flex align-items-center">
                        <div className="bg-light-danger rounded-3 p-3 me-4 text-danger d-none d-md-block">
                          <FiFlag size={24} />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold text-dark">vs {m.opponent}</h6>
                          <div className="d-flex flex-wrap gap-3 text-muted small">
                            <span><FiMapPin className="me-1" /> {m.venue || "Home Ground"}</span>
                            <span><FiCalendar className="me-1" /> {moment(m.matchDate).format("DD MMM YYYY")}</span>
                          </div>
                        </div>
                        <FiChevronRight className="text-muted" />
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR: QUICK ACTIONS & ALERTS */}
        <div className="col-12 col-xl-4">
          <div className="d-flex flex-column gap-4">
            
            {/* QUICK ACTIONS */}
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h6 className="fw-bold mb-3 text-uppercase small text-muted letter-spacing-1">Quick Actions</h6>
              <div className="d-grid gap-2">
                <Link to="/coach/attendance" className="btn btn-outline-primary py-2 rounded-3 text-start d-flex align-items-center">
                  <FiCheckSquare className="me-3" /> Mark Attendance
                </Link>
                <Link to="/coach/matches" className="btn btn-primary py-2 rounded-3 text-start d-flex align-items-center">
                  <FiPlus className="me-3" /> Schedule New Match
                </Link>
              </div>
            </div>

            {/* PENDING MEDICAL LEAVES */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white border-0 pt-4 px-4 pb-2 d-flex align-items-center">
                <FiAlertCircle className="text-danger me-2" size={20} />
                <h6 className="mb-0 fw-bold">Pending Medical Leaves</h6>
              </div>
              <div className="card-body px-4 pb-4">
                {topLeaves.length === 0 ? (
                  <p className="text-muted small mb-0">All clear! No pending leaves.</p>
                ) : (
                  topLeaves.map(l => (
                    <div key={l._id} className="d-flex align-items-start mb-3 last-child-mb-0">
                      <div className="bg-danger rounded-circle p-1 me-3 mt-1" style={{ width: "8px", height: "8px" }}></div>
                      <div>
                        <div className="fw-bold small">{l.studentName}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {moment(l.startDate).format("DD MMM")} • {l.reason}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <Link to="/coach/medical" className="btn btn-link btn-sm text-decoration-none p-0 mt-3 text-danger fw-bold small">
                  View all requests <FiChevronRight />
                </Link>
              </div>
            </div>

            {/* ANNOUNCEMENTS */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white border-0 pt-4 px-4 pb-2 d-flex align-items-center">
                <FiBell className="text-warning me-2" size={20} />
                <h6 className="mb-0 fw-bold">Recent Announcements</h6>
              </div>
              <div className="card-body px-4 pb-4">
                {topAnnouncements.length === 0 ? (
                  <p className="text-muted small mb-0">No recent announcements.</p>
                ) : (
                  topAnnouncements.map(a => (
                    <div key={a._id} className="mb-3 last-child-mb-0">
                      <div className="fw-bold small text-truncate" style={{ maxWidth: "250px" }}>{a.title}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {moment(a.createdAt).fromNow()}
                      </div>
                    </div>
                  ))
                )}
                <Link to="/coach/announcements" className="btn btn-link btn-sm text-decoration-none p-0 mt-2 fw-bold small">
                  Open Board <FiChevronRight />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}