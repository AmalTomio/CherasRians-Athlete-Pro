// src/config/classGroups.js

// Default fallback (ALL)
export const ALL_CLASS_GROUPS = [
  "DINAMIK",
  "EFEKTIF",
  "INOVATIF",
  "INTELEK",
  "PROAKTIF",
  "GAMELAN",
  "SAPELELE",
  "IMTIAZ",
  "ALPHA",
  "BETA",
  "DELTA",
  "COMMERCE",
  "KREATIF",
  "SINERGI",
  "ARTISTIK",
  "GOURMET",
];

// Dynamic class options based on year
export function getClassOptionsForYear(year) {
  if (["1", "2", "3"].includes(String(year))) {
    return [
      "DINAMIK",
      "EFEKTIF",
      "INOVATIF",
      "INTELEK",
      "PROAKTIF",
      "GAMELAN",
      "SAPELELE",
      "IMTIAZ",
    ];
  }

  if (["4", "5"].includes(String(year))) {
    return [
      "ALPHA",
      "BETA",
      "DELTA",
      "COMMERCE",
      "KREATIF",
      "SINERGI",
      "ARTISTIK",
      "GOURMET",
    ];
  }

  return []; // default → if no year selected
}
