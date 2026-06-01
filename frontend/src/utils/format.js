/* ================= STATUS ================= */
export const formatStatus = (status = "") =>
  status.charAt(0).toUpperCase() + status.slice(1);

/* ================= TEXT ================= */
export const capitalizeFirst = (text = "") =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

/* ================= LABEL ================= */
export const formatLabel = (value = "") => {
  if (!value) return "";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/* ================= SPORT ================= */
export const formatSportName = formatLabel;
