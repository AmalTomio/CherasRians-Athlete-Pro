import React, { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "react-bootstrap";
import moment from "moment";
import {
  FiCalendar, FiUsers, FiActivity, FiRefreshCw,
  FiCheckSquare, FiPlus, FiAlertCircle, FiFileText,
  FiClock, FiMapPin, FiFlag
} from "react-icons/fi";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import HeroBanner from "../../components/HeroBanner";
import StatCard from "../../components/StatCard";

import { coachService } from "../../services/coachServices";
import { initSocket } from "../../socket";

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
    const token = localStorage.getItem("token");
    const socket = initSocket(token);
    if (!socket) return;

    const handler = () => {
      queryClient.invalidateQueries();
    };

    socket.on("dashboard_update", handler);
    return () => socket.off("dashboard_update", handler);
  }, [queryClient]);

  /* ================= LOADING ================= */

  if (
    loadingDashboard ||
    loadingLeaves ||
    loadingAnnouncements ||
    loadingSchedules ||
    loadingMatches
  ) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  /* ================= FIXED LOGIC ================= */

  const now = new Date();

  const upcomingMatches = matches
    .filter(m => new Date(m.matchDate).getTime() >= now.getTime() && m.status !== "completed")
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate))
    .slice(0, 5);

  const upcomingTraining = schedules
    .filter(s => new Date(s.startAt).getTime() >= now.getTime()) // ✅ FIXED FIELD
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .slice(0, 5);

  const kpi = dashboardData?.kpi ?? {
    totalPlayers: 0,
    attendanceRate: 0,
    upcomingSessions: 0,
  };

  const topLeaves = leaves.slice(0, 5);
  const topAnnouncements = announcements.slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  /* ================= UI ================= */

  return (
    <div className="px-4 py-4 w-100">

      {/* HERO */}
      <HeroBanner
        title={`${getGreeting()}, Coach ${firstName}! 👋`}
        subtitle={`Here is your squad overview for ${moment().format("dddd, MMMM Do YYYY")}.`}
        buttonText="Refresh Data"
        buttonIcon={FiRefreshCw}
        onButtonClick={() => queryClient.invalidateQueries()}
      />

      {/* KPI */}
      <div className="row g-4 mb-4">
        <StatCard title="Total Players" value={kpi.totalPlayers} icon={<FiUsers size={22} />} />
        <StatCard title="Upcoming Sessions" value={kpi.upcomingSessions || upcomingTraining.length} icon={<FiCalendar size={22} />} />
        <StatCard title="Avg. Attendance (7d)" value={`${kpi.attendanceRate}%`} icon={<FiActivity size={22} />} />
      </div>

      {/* UPCOMING */}
      <div className="row g-4 mb-4">

        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0 rounded-4 bg-white">

            <div className="card-header bg-white">
              <button
                className={`btn btn-sm ${activeTab === "training" ? "fw-bold text-primary" : ""}`}
                onClick={() => setActiveTab("training")}
              >
                <FiActivity className="me-2" /> Training
              </button>

              <button
                className={`btn btn-sm ${activeTab === "matches" ? "fw-bold text-primary" : ""}`}
                onClick={() => setActiveTab("matches")}
              >
                <FiFlag className="me-2" /> Matches
              </button>
            </div>

            <div className="card-body">

              {activeTab === "training" ? (
                upcomingTraining.length === 0 ? (
                  <p className="text-muted text-center">No upcoming training</p>
                ) : (
                  upcomingTraining.map(t => (
                    <div key={t._id} className="mb-2">
                      <strong>{t.title || "Training Session"}</strong><br />
                      <small>
                        {moment(t.startAt).format("DD MMM YYYY")} • {t.startTime} - {t.endTime}
                      </small>
                    </div>
                  ))
                )
              ) : (
                upcomingMatches.length === 0 ? (
                  <p className="text-muted text-center">No upcoming matches</p>
                ) : (
                  upcomingMatches.map(m => (
                    <div key={m._id} className="mb-2">
                      <strong>vs {m.opponent}</strong><br />
                      <small>
                        {moment(m.matchDate).format("DD MMM YYYY")} • {m.venue || "TBA"}
                      </small>
                    </div>
                  ))
                )
              )}

            </div>
          </div>
        </div>

        {/* QUICK ACTION */}
        <div className="col-12 col-xl-4">
          <Link to="/coach/attendance" className="btn btn-light w-100 mb-2">
            <FiCheckSquare className="me-2" /> Mark Attendance
          </Link>

          <Link to="/coach/matches" className="btn btn-primary w-100">
            <FiPlus className="me-2" /> Schedule Match
          </Link>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="row g-4">

        <div className="col-12 col-lg-6">
          <div className="card p-4">
            <h5 className="fw-bold mb-3">
              <FiAlertCircle className="me-2 text-danger" />
              Pending Medical Leaves
            </h5>

            {topLeaves.length === 0 ? (
              <p className="text-muted">No pending leaves</p>
            ) : (
              topLeaves.map(l => (
                <div key={l._id} className="mb-2">
                  <strong>{l.studentName}</strong><br />
                  <small>{moment(l.startDate).format("DD MMM")} • {l.reason}</small>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card p-4">
            <h5 className="fw-bold mb-3">Announcements</h5>

            {topAnnouncements.length === 0 ? (
              <p className="text-muted">No announcements</p>
            ) : (
              topAnnouncements.map(a => (
                <div key={a._id} className="mb-2">
                  <strong>{a.title}</strong><br />
                  <small>{moment(a.createdAt).format("DD MMM YYYY")}</small>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}