import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
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
} from "react-icons/fi";

import "./Sidebar.css";

export default function Sidebar({ onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("");

  // Load user role
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role) setRole(user.role);
  }, []);

  // Notify layout whenever collapsed changes
  useEffect(() => {
    if (typeof onToggle === "function") {
      onToggle(collapsed);
    }
  }, [collapsed]);

  // Auto-collapse on small screens
  useEffect(() => {
    const updateCollapse = () => setCollapsed(window.innerWidth < 1025);
    updateCollapse();
    window.addEventListener("resize", updateCollapse);
    return () => window.removeEventListener("resize", updateCollapse);
  }, []);

  // MENU
  const menu = useMemo(() => {
    const baseMenu = {
      student: [
        ["Dashboard", FiHome, "/dashboard"],
        ["Training Schedule", FiCalendar, "/schedule"],
        ["Attendance", FiClipboard, "/attendance"],
        ["Medical Leave", FiFileText, "/student/medical"],
        ["Performance", FiUsers, "/performance"],
        ["Announcements", FiBell, "/announcements"],
      ],
      coach: [
        ["Dashboard", FiHome, "/dashboard"],
        ["My Teams", FiUsers, "/dashboard/teams"],
        ["Players", FiUser, "/coach/players"],
        ["Schedules", FiCalendar, "/dashboard/schedules"],
        ["Facilities", FiFileText, "/coach/facilities"],
        ["Medical Leave", FiFileText, "/coach/medical"],
        ["Attendance", FiClipboard, "/coach/attendance"],
        ["Equipment", FiTool, "/dashboard/equipment"],
        ["Announcements", FiBell, "/dashboard/announcements"],
      ],
      exco: [
        ["Dashboard", FiHome, "/dashboard"],
        ["Manage Students", FiUsers, "/exco/manageStudents"],
        ["Manage Coaches", FiUsers, "/exco/manageCoaches"],
        ["Facilities", FiTool, "/exco/facilities"],
        ["Booking", FiCalendar, "/exco/booking"],
        ["Equipment", FiTool, "/exco/equipment"],
        ["Announcements", FiBell, "/announcements"],
      ],
    };

    return baseMenu[role] || [];
  }, [role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <h4 className="sidebar-title">Sport System</h4>}
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          <FiMenu />
        </button>
      </div>

      <div className="sidebar-menu-wrapper">
        <ul className="sidebar-menu">
          {menu.map(([label, Icon, path], idx) => (
            <li key={idx}>
              <Link
                to={path}
                className={`sidebar-link ${
                  location.pathname === path ? "active" : ""
                }`}
              >
                <span className="icon">
                  <Icon />
                </span>
                {!collapsed && <span className="label">{label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-divider"></div>

        <button className="sidebar-link logout" onClick={handleLogout}>
          <span className="icon">
            <FiLogOut />
          </span>
          {!collapsed && <span className="label">Logout</span>}
        </button>
      </div>
    </div>
  );
}
