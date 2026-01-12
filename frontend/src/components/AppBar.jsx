import React from "react";
import { FiAward, FiUser } from "react-icons/fi";

export default function AppBar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "User";
  const firstName = user?.firstName || "Guest";
  const sport = user?.sport || null;

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  const formatSport = (s) =>
    s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;

  return (
    <nav
      className="navbar navbar-light bg-white border-bottom px-4 py-3 sticky-top shadow-sm"
      style={{ zIndex: 99, height: "85px" }}
    >
      <div className="container-fluid px-0 d-flex align-items-center justify-content-between">
        
        <div className="d-flex align-items-center h-100">
          
          <div className="d-flex flex-column justify-content-center">
            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: "0.65rem", letterSpacing: "1.2px", marginBottom: "2px" }}>
              Welcome back,
            </small>
            <h4 className="m-0 fw-bold text-dark d-flex align-items-center" style={{ letterSpacing: "-0.5px" }}>
              {firstName}
            </h4>
          </div>

          {(sport || role) && (
             <div 
               className="mx-4" 
               style={{ 
                 height: "45px", 
                 width: "1px", 
                 background: "linear-gradient(to bottom, transparent, #e5e7eb, transparent)" 
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
                letterSpacing: "0.5px"
              }}
            >
              <FiAward size={18} />
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
                letterSpacing: "0.5px"
              }}
            >
              <FiUser size={18} />
              {sport ? formatSport(sport) : "General"} Athlete
            </span>
          )}
        </div>

        <div className="d-none d-md-block text-end">
           <span 
             className="text-secondary fw-medium" 
             style={{ 
               fontSize: "0.9rem",
               background: "#f8fafc",
               padding: "8px 16px",
               borderRadius: "8px",
               border: "1px solid #e2e8f0"
             }}
           >
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
           </span>
        </div>

      </div>
    </nav>
  );
}