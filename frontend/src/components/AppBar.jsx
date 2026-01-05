export default function AppBar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "User";
  const firstName = user?.firstName || "";
  const sport = user?.sport || null; // for coaches OR assigned sport for players

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  const formatSport = (s) =>
    s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;

  return (
    <div
      style={{
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 25px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e5e5",
        position: "relative",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* LEFT SIDE */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
          Welcome back {capitalize(role)} {firstName}
        </h2>

        {/* --- COACH BADGE --- */}
        {role === "coach" && sport && (
          <span
            style={{
              backgroundColor: "#4f46e5",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {formatSport(sport)}
          </span>
        )}

        {/* --- PLAYER BADGE --- */}
        {role === "student" && (
          <span
            style={{
              backgroundColor: "#059669",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {sport ? formatSport(sport) : "Unassigned"} Player
          </span>
        )}
      </div>
    </div>
  );
}
