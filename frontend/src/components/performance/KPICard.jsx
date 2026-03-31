import React from "react";

export default function KPICard({ title, value, subtitle, icon, color = "primary" }) {
  return (
    <div className="card border-0 shadow-sm h-100 rounded-4" style={{ background: "#ffffff" }}>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="text-muted fw-medium">{title}</div>
          {icon && (
            <div 
              className={`d-flex align-items-center justify-content-center text-${color} bg-${color} bg-opacity-10`}
              style={{ width: "40px", height: "40px", borderRadius: "12px" }}
            >
              {icon}
            </div>
          )}
        </div>
        <div className="fs-2 fw-bold mb-1 text-dark">{value}</div>
        {subtitle && <div className="text-muted fs-7 small">{subtitle}</div>}
      </div>
    </div>
  );
}
