import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
// 1. New Sports Icon
import { FaRunning, FaRegBuilding } from "react-icons/fa";
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
  FiFileText,
  FiActivity,
  FiGrid,
} from "react-icons/fi";

import "./Sidebar.css";

const getInitials = (role) => (role ? role.slice(0, 2).toUpperCase() : "US");

export default function Sidebar({ onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
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
      if (window.innerWidth < 1025) setCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menu = useMemo(() => {
    const baseMenu = {
      student: [
        ["Dashboard", FiHome, "/dashboard"],
        ["Training", FiCalendar, "/schedule"],
        ["Attendance", FiClipboard, "/attendance"],
        ["Medical", FiActivity, "/student/medical"],
        ["Performance", FiUsers, "/performance"],
        ["Notices", FiBell, "/announcements"],
      ],
      coach: [
        ["Dashboard", FiGrid, "/dashboard"],
        ["My Teams", FiUsers, "/coach/teams"],
        ["Players", FiUser, "/coach/players"],
        ["Schedules", FiCalendar, "/coach/schedule"],
        ["Facilities", FaRegBuilding, "/coach/facilities"],
        ["Med-Reviews", FiActivity, "/coach/medical"],
        ["Attendance", FiClipboard, "/coach/attendance"],
        ["Equipment", FiTool, "/coach/equipment"],
        ["Announcement", FiBell, "/coach/announcements"],
      ],
      exco: [
        ["Overview", FiHome, "/dashboard"],
        ["Students", FiUsers, "/exco/manageStudents"],
        ["Coaches", FiUser, "/exco/manageCoaches"],
        ["Facilities", FaRegBuilding, "/exco/facilities"],
        ["Booking", FiCalendar, "/exco/booking"],
        ["Inventory", FiTool, "/exco/equipment"],
        ["Announcement", FiBell, "/announcements"],
      ],
    };

    return baseMenu[user.role] || [];
  }, [user.role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* BRAND HEADER */}
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <div className="brand-logo">
            {/* 2. Using the Athlete Icon */}
            <FaRunning style={{ marginLeft: "2px" }} />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <h4 className="m-0">CherasRians</h4>
              <span className="brand-subtitle">Athlete Pro</span>
            </div>
          )}
        </div>
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          <FiMenu />
        </button>
      </div>

      {/* MENU LIST */}
      <div className="sidebar-menu-wrapper">
        <p className="menu-label">{!collapsed ? "Main Menu" : "..."}</p>
        <ul className="sidebar-menu">
          {menu.map(([label, Icon, path], idx) => {
            const isActive = location.pathname === path;
            return (
              <li key={idx}>
                <Link
                  to={path}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                >
                  <div className="icon-wrapper">
                    <Icon />
                  </div>
                  {!collapsed && <span className="label">{label}</span>}

                  {isActive && !collapsed && <div className="active-glow" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">
        {!collapsed && (
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
  );
}
