import React, { useEffect, useState, useRef } from "react";
import {
  FiUser,
  FiBell,
  FiShield,
  FiCalendar,
  FiCheck,
  FiMenu, // Added FiMenu
} from "react-icons/fi";
import api from "../api/axios";
import { io } from "socket.io-client";

export default function AppBar({ onMenuClick }) { // Added onMenuClick prop
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const role = user?.role || "User";
  const firstName = user?.firstName || "Guest";
  const sport = user?.sport || null;

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const dropdownRef = useRef();
  const socketRef = useRef();

  const capitalize = (text) => text?.charAt(0).toUpperCase() + text?.slice(1);
    const apiUrl = import.meta.env.VITE_API_URL;

  const formatSport = (s) =>
    s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!token) return;

    socketRef.current = io(apiUrl, { auth: { token } });
    socketRef.current.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => socketRef.current.disconnect();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav
      className="navbar navbar-light bg-white border-bottom px-3 px-md-4 sticky-top"
      style={{
        zIndex: 100,
        height: "85px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      }}
    >
      <div className="container-fluid px-0 d-flex align-items-center justify-content-between">
        
        <div className="d-flex align-items-center h-100 overflow-hidden gap-3">
          
          <button
            className="btn d-lg-none d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
            onClick={onMenuClick}
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              borderRadius: "8px",
              width: "42px",
              height: "42px",
              border: "none",
              padding: 0
            }}
          >
            <FiMenu size={22} />
          </button>

          <div
            className="d-flex flex-column justify-content-center"
            style={{ minWidth: 0 }}
          >
            <h5
              className="m-0 fw-bold text-dark"
              style={{ letterSpacing: "-0.5px"}}
              title={`Welcome, ${capitalize(firstName)}`}
            >
              Welcome, {capitalize(firstName)}
            </h5>
          </div>

          {(sport || role) && (
            <div
              className="mx-2 mx-md-4 d-none d-lg-block"
              style={{ height: "40px", width: "1px", background: "#e2e8f0" }}
            />
          )}

          <div className="d-none d-lg-flex align-items-center gap-2">
            {role === "exco" && (
              <span
                className="badge rounded-pill d-flex align-items-center gap-2 shadow-sm border border-warning-subtle text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                }}
              >
                <FiShield size={16} /> Exco Admin
              </span>
            )}

            {role === "coach" && sport && (
              <span
                className="badge rounded-pill d-flex align-items-center gap-2 shadow-sm text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", 
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                }}
              >
                <FiUser size={16} /> {formatSport(sport)} Coach
              </span>
            )}

            {role === "student" && (
              <span
                className="badge rounded-pill d-flex align-items-center gap-2 shadow-sm text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", 
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                }}
              >
                <FiUser size={16} /> {sport ? formatSport(sport) : "General"}{" "}
                Athlete
              </span>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Clock & Notifications */}
        <div className="d-flex align-items-center gap-3 gap-md-4">
          <div className="d-none d-md-flex flex-column align-items-end text-end lh-sm">
            <span
              className="fw-bold text-dark d-flex align-items-center gap-2"
              style={{ fontSize: "1.1rem", fontFamily: "monospace" }}
            >
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span className="text-muted small fw-medium d-flex align-items-center gap-1">
              <FiCalendar size={12} />
              {currentTime.toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div
            style={{ height: "40px", width: "1px", background: "#e2e8f0" }}
            className="d-none d-md-block"
          />

          <div className="position-relative" ref={dropdownRef}>
            <button
              className={`btn btn-light position-relative shadow-sm border ${showDropdown ? "bg-light" : "bg-white"}`}
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                borderRadius: "12px",
                width: "45px",
                height: "45px",
                transition: "all 0.2s",
              }}
            >
              <FiBell
                size={20}
                className={unreadCount > 0 ? "text-primary" : "text-secondary"}
              />
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger border border-white"
                  style={{
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className="position-absolute bg-white shadow-lg rounded-4 mt-3 dropdown-animation"
                style={{
                  right: 0,
                  width: "360px",
                  maxWidth: "90vw",
                  maxHeight: "450px",
                  overflowY: "auto",
                  zIndex: 1000,
                  border: "1px solid #f1f5f9",
                }}
              >
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light sticky-top">
                  <span className="fw-bold text-dark">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="badge bg-primary rounded-pill">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="list-group list-group-flush">
                  {notifications.length === 0 ? (
                    <div className="p-5 text-center text-muted">
                      <div className="mb-3 bg-light rounded-circle d-inline-flex p-3">
                        <FiBell size={24} className="opacity-25" />
                      </div>
                      <p className="m-0 small fw-semibold">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n._id}
                        className={`list-group-item list-group-item-action p-3 border-bottom ${!n.read ? "bg-primary-subtle bg-opacity-10" : "bg-white"}`}
                        onClick={() => !n.read && markAsRead(n._id)}
                        style={{
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                      >
                        <div className="d-flex gap-3">
                          <div
                            className={`mt-1 rounded-circle p-1 d-flex align-items-center justify-content-center flex-shrink-0 ${!n.read ? "bg-primary text-white" : "bg-secondary bg-opacity-25 text-secondary"}`}
                            style={{ width: "8px", height: "8px" }}
                          ></div>

                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <span
                                className={`small ${!n.read ? "fw-bold text-dark" : "fw-medium text-secondary"}`}
                              >
                                {n.title}
                              </span>
                              <span
                                className="text-muted ms-2"
                                style={{
                                  fontSize: "0.65rem",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="mb-1 text-secondary small lh-sm">
                              {n.message}
                            </p>
                            {n.read && (
                              <div
                                className="text-success small d-flex align-items-center gap-1"
                                style={{ fontSize: "0.7rem" }}
                              >
                                <FiCheck size={12} /> Read
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simple Animation */}
      <style>
        {`
          .dropdown-animation {
            animation: slideDown 0.2s ease-out;
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </nav>
  );
}