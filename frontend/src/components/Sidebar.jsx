import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { FaRegBuilding } from "react-icons/fa";
import {
  FiHome,
  FiUsers,
  FiUser,
  FiClipboard,
  FiBell,
  FiCalendar,
  FiTool,
  FiMenu,
  FiLogOut,
  FiActivity,
  FiGrid,
  FiStar,
  FiX,
} from "react-icons/fi";

import "./Sidebar.css";

const getInitials = (role) => (role ? role.slice(0, 2).toUpperCase() : "US");

export default function Sidebar({ onToggle, isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [user, setUser] = useState({ role: "", name: "User" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  useEffect(() => {
    if (typeof onToggle === "function") {
      onToggle(collapsed);
    }
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menu = useMemo(() => {
    const baseMenu = {
      student: [
        ["Dashboard", FiHome, "/dashboard"],
        ["Schedule", FiCalendar, "/student/schedule"],
        ["Attendance", FiClipboard, "/student/attendance"],
        ["Medical", FiActivity, "/student/medical"],
        ["Performance", FiStar, "/student/performance"],
        ["Announcement", FiBell, "/student/announcements"],
        ["Profile", FiUser, "/profile"],
      ],
      coach: [
        ["Dashboard", FiGrid, "/dashboard"],
        ["My Teams", FiUsers, "/coach/teams"],
        ["Players", FiUser, "/coach/players"],
        ["Matches", FiActivity, "/coach/matches"],
        ["Performance", FiStar, "/coach/performance"],
        ["Disciplinary", FiClipboard, "/coach/disciplinary"],
        ["Schedules", FiCalendar, "/coach/schedule"],
        ["Facilities", FaRegBuilding, "/coach/facilities"],
        ["Med-Reviews", FiActivity, "/coach/medical"],
        ["Attendance", FiClipboard, "/coach/attendance"],
        ["Equipment", FiTool, "/coach/equipment"],
        ["Announcement", FiBell, "/coach/announcements"],
        ["Profile", FiUser, "/profile"],
      ],
      exco: [
        ["Overview", FiHome, "/dashboard"],
        ["Students", FiUsers, "/exco/manageStudents"],
        ["Coaches", FiUser, "/exco/manageCoaches"],
        ["Matches", FiActivity, "/exco/matches"],
        ["Disciplinary", FiClipboard, "/exco/disciplinary"],
        ["Facilities", FaRegBuilding, "/exco/facilities"],
        ["Booking", FiCalendar, "/exco/booking"],
        ["Inventory", FiTool, "/exco/equipment"],
        ["Announcement", FiBell, "/exco/announcements"],
        ["Profile", FiUser, "/profile"],
      ],
    };

    return baseMenu[user.role] || [];
  }, [user.role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const sidebarClass = isMobile
    ? `sidebar ${isOpen ? "mobile-open" : "mobile-closed"}`
    : `sidebar ${collapsed ? "collapsed" : ""}`;

  return (
    <>
      {isMobile && isOpen && (
        <div className="sidebar-backdrop" onClick={onClose}></div>
      )}

      <div className={sidebarClass}>
        <div className="sidebar-header">
          {(!collapsed || isMobile) && (
            <div className="brand-wrapper">
              {/* Replaced specific logo with a generic icon */}
              <div className="brand-logo">
                <img
                  src="/sys-logo.png"
                  alt="CherasRians Logo"
                  className="brand-logo-img"
                />
              </div>
              <div className="brand-text">
                {/* Replaced Brand Name */}
                <h4 className="m-0">CherasRians</h4>

                <span className="brand-subtitle">Athletes Pro</span>
              </div>
            </div>
          )}

          {!isMobile && (
            <button
              className="toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
            >
              <FiMenu />
            </button>
          )}

          {isMobile && (
            <button className="toggle-btn text-white" onClick={onClose}>
              <FiX />
            </button>
          )}
        </div>

        <div className="sidebar-menu-wrapper">
          <p className="menu-label">
            {!collapsed || isMobile ? "Main Menu" : "..."}
          </p>
          <ul className="sidebar-menu">
            {menu.map(([label, Icon, path], idx) => {
              const isActive = location.pathname === path;
              return (
                <li key={idx}>
                  <Link
                    to={path}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                    onClick={() => {
                      if (isMobile && onClose) onClose();
                    }}
                  >
                    <div className="sb-icon">
                      <Icon />
                    </div>
                    {(!collapsed || isMobile) && (
                      <span className="label">{label}</span>
                    )}
                    {isActive && (!collapsed || isMobile) && (
                      <div className="active-glow" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sidebar-footer">
          {(!collapsed || isMobile) && (
            <div className="user-info">
              <div className="user-avatar">{getInitials(user.role)}</div>
              <div className="user-details">
                <span className="user-name text-truncate">
                  {user.firstName || user.role?.toUpperCase()}
                </span>
                <span className="user-role">{user.role} Account</span>
              </div>
            </div>
          )}

          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </div>
    </>
  );
}
