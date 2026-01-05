import { TrophyIcon } from "@primer/octicons-react";

export default function Banner({ student }) {
  const getStatusConfig = () => {
    if (!student.isActive) {
      return { label: "Inactive", color: "#9ca3af" };
    }

    switch (student.status) {
      case "suspended":
        return { label: "Suspended", color: "#ef4444" };
      case "injured":
        return { label: "Injured", color: "#f59e0b" };
      default:
        return { label: "Active", color: "#22c55e" };
    }
  };

  const status = getStatusConfig();

  return (
    <div
      style={{
        width: "100%",
        padding: "2rem 2.25rem",
        borderRadius: "22px",
        background:
          "linear-gradient(90deg, #3b82f6 0%, #6366f1 45%, #9333ea 100%)",
        color: "#ffffff",
        boxShadow: "0 25px 45px rgba(0,0,0,0.25)",
        marginBottom: "1.75rem",
      }}
    >
      <div style={{ display: "flex", gap: "1.25rem" }}>
        {/* Icon */}
        <div
          style={{
            width: 75,
            height: 75,
            borderRadius: "16px",
            background: "#5b82f6", // solid blue like the image
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrophyIcon size={55} color="#ffffff" />
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: "1.55rem", fontWeight: 700 }}>
            Player Dashboard
          </h2>

          <p style={{ margin: "0.35rem 0 1rem", opacity: 0.9 }}>
            Track your performance and stay updated with your teams
          </p>

          {/* ✅ REAL STATUS BADGE */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.45rem 0.9rem",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.2)",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: status.color,
              }}
            />
            {status.label} • Form {student.year}
          </div>
        </div>
      </div>
    </div>
  );
}
