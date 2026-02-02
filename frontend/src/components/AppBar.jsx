import React, { useEffect, useState, useRef } from "react";
import { FiUser, FiBell } from "react-icons/fi";
import api from "../api/axios";
import { io } from "socket.io-client";

export default function AppBar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "User";
  const firstName = user?.firstName || "Guest";
  const sport = user?.sport || null;

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const socketRef = useRef(null);

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  const formatSport = (s) =>
    s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;

  /* ===============================
     FETCH NOTIFICATIONS
  =============================== */
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  /* ===============================
     SOCKET CONNECTION
  =============================== */
  useEffect(() => {
    fetchNotifications();

    const token = localStorage.getItem("token");

    socketRef.current = io("http://localhost:5000", {
      auth: { token },
    });

    socketRef.current.on("new_notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav
      className="navbar navbar-light bg-white border-bottom px-4 py-3 sticky-top shadow-sm"
      style={{ zIndex: 99, height: "85px" }}
    >
      <div className="container-fluid px-0 d-flex align-items-center justify-content-between">
        {/* LEFT SIDE */}
        <div className="d-flex align-items-center h-100">
          <div className="d-flex flex-column justify-content-center">
            <h4 className="m-0 fw-bold text-dark d-flex align-items-center">
              Welcome, {capitalize(firstName)}
            </h4>
          </div>

          {(sport || role) && (
            <div
              className="mx-4"
              style={{
                height: "45px",
                width: "1px",
                background:
                  "linear-gradient(to bottom, transparent, #e5e7eb, transparent)",
              }}
            />
          )}

          {role === "coach" && sport && (
            <span
              className="badge rounded-pill d-flex align-items-center gap-2 shadow-sm"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                padding: "10px 18px",
                fontSize: "0.85rem",
                fontWeight: "600",
              }}
            >
              <FiUser size={18} />
              {formatSport(sport)} Coach
            </span>
          )}

          {role === "student" && (
            <span
              className="badge rounded-pill d-flex align-items-center gap-2 shadow-sm"
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                padding: "10px 18px",
                fontSize: "0.85rem",
                fontWeight: "600",
              }}
            >
              <FiUser size={18} />
              {sport ? formatSport(sport) : "General"} Athlete
            </span>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="d-flex align-items-center gap-4 position-relative">
          
          {/* 🔔 Notification Bell */}
          <div style={{ position: "relative", cursor: "pointer" }}>
            <FiBell
              size={22}
              onClick={() => setShowDropdown(!showDropdown)}
            />

            {unreadCount > 0 && (
              <span
                className="badge bg-danger"
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-8px",
                  fontSize: "0.65rem",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div
              className="card shadow-sm"
              style={{
                position: "absolute",
                top: "50px",
                right: "0",
                width: "300px",
                maxHeight: "350px",
                overflowY: "auto",
                zIndex: 999,
              }}
            >
              <div className="card-header fw-bold">Notifications</div>
              <div className="list-group list-group-flush">
                {notifications.length === 0 ? (
                  <div className="p-3 text-muted text-center">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n._id}
                      className="list-group-item small"
                      style={{
                        backgroundColor: n.read ? "#fff" : "#f1f5f9",
                      }}
                    >
                      <div className="fw-semibold">{n.title}</div>
                      <div className="text-muted">{n.message}</div>
                      <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* DATE */}
          <div className="d-none d-md-block text-end">
            <span
              className="text-secondary fw-medium"
              style={{
                fontSize: "0.9rem",
                background: "#f8fafc",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
