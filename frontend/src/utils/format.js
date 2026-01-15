export const formatStatus = (status = "") =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const capitalizeFirst = (text = "") =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
