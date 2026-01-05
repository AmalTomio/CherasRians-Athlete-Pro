import Avatar from "../Avatar";

export default function Profile({ student, coach }) {
  const fullName = `${student.firstName} ${student.lastName}`;
  const formatSport = (sport) => {
    if (!sport) return "-";

    return sport
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div
      style={{
        borderRadius: "22px",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        background: "#ffffff",
        maxWidth: "900px",
      }}
    >
      {/* ===== TOP GRADIENT HEADER ===== */}
      <div
        style={{
          padding: "1.75rem 2rem",
          background:
            "linear-gradient(90deg, #2563eb 0%, #6366f1 45%, #9333ea 100%)",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* Left: Avatar + Name */}
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          {/* ✅ Reused Avatar */}
          <Avatar name={fullName} />

          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
              {fullName}
            </div>

            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              {student.sport}
            </div>

            {/* Category Badge */}
            <div
              style={{
                marginTop: "0.6rem",
                display: "inline-flex",
                padding: "0.35rem 0.75rem",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.2)",
                fontSize: "0.8rem",
              }}
            >
              {student.category}
            </div>
          </div>
        </div>

        {/* Right: Status */}
        <div style={{ textAlign: "right", fontSize: "0.9rem" }}>
          <div style={{ opacity: 0.85 }}>Status</div>
          <div style={{ fontWeight: 600 }}>
            {student.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div
        style={{
          padding: "2rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* Personal Info */}
        <div>
          <h3 style={{ marginBottom: "1rem" }}>Personal Information</h3>

          <div style={{ marginBottom: "0.75rem" }}>
            <strong>Form</strong>
            <div>Form {student.year}</div>
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <strong>Class</strong>
            <div>{student.classGroup}</div>
          </div>

          <div>
            <strong>Sport</strong>
            <div>{formatSport(student.sport)}</div>
          </div>
        </div>

        {/* Coach Info */}
        <div>
          <h3 style={{ marginBottom: "1rem" }}>Coach Information</h3>

          <div>
            <strong>Assigned Coach</strong>
            <div>{coach?.name || "Not Assigned"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
