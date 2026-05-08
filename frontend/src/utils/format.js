
/* ================= STATUS ================= */
export const formatStatus = (status = "") =>
  status.charAt(0).toUpperCase() + status.slice(1);

/* ================= TEXT ================= */
export const capitalizeFirst = (text = "") =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

/* ================= SPORT ================= */
export const formatSportName = (sport = "") => {
  if (!sport) return "General";

  return sport
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};