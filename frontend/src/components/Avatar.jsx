export default function Avatar({ name, size = 56 }) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "14px", 
        backgroundColor: "#3b82f6", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.45,
        color: "#ffffff",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}
