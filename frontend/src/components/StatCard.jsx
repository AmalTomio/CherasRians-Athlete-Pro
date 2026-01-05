export default function StatCard({
  title,
  value,
  icon,
  iconBg = "#eef2ff",
  iconColor = "#2563eb",
}) {
  return (
    <div className="col-md-4">
      <div
        className="card border-0 shadow-sm h-100 rounded-4"
        style={{ background: "#ffffff" }}
      >
        <div className="card-body d-flex align-items-center justify-content-between">
          {/* LEFT: TEXT */}
          <div>
            <div className="text-muted fw-medium mb-1">{title}</div>
            <div className="fs-2 fw-bold">{value}</div>
          </div>

          {/* RIGHT: ICON */}
          {icon && (
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: iconBg,
                color: iconColor,
              }}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
