import React from "react";
import {
  getClassOptionsForYear,
  ALL_CLASS_GROUPS,
} from "../config/classGroups";
// Using React Icons for the reset icon (optional, but matches your Sidebar style)
import { FiRefreshCw, FiSearch } from "react-icons/fi"; 

export default function FiltersCard({
  // SEARCH
  search,
  setSearch,

  // YEAR / CLASS
  year,
  setYear,
  classGroup,
  setClassGroup,

  // SPORT
  sport,
  setSport,

  // STATUS
  status,
  setStatus,

  // DATE RANGE (OPTIONAL)
  startDate = "",
  setStartDate = () => {},
  endDate = "",
  setEndDate = () => {},

  // UI FLAGS
  showYear = true,
  showClass = true,
  showSport = true,
  showStatus = false,
  showDate = false,

  // ACTION
  onReset,

  searchPlaceholder = "Search records...",
}) {
  const safeSearch = search || "";
  const safeYear = year || "";
  const safeClassGroup = classGroup || "";
  const safeSport = sport || "";
  const safeStatus = status || "";

  const classOptions = getClassOptionsForYear(safeYear) || ALL_CLASS_GROUPS;

  // Theme Constants
  const THEME = {
    indigo: "#6366f1",
    lightBlue: "#e0f2fe", // Very pale blue for backgrounds
    indigoText: "#4338ca",
    borderColor: "#e2e8f0"
  };

  const inputStyle = {
    borderColor: THEME.borderColor,
    fontSize: "0.9rem",
    padding: "10px 12px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    transition: "all 0.2s ease"
  };

  const labelStyle = {
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: THEME.indigoText, // Indigo Text
    marginBottom: "6px"
  };

  return (
    <div 
      className="card border-0 shadow-sm mb-4"
      style={{ 
        borderTop: `4px solid ${THEME.indigo}`, // Top accent
        borderRadius: "12px",
        overflow: "hidden" 
      }}
    >
      <div className="card-body p-4">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="row g-3 align-items-end">
            
            {/* === SEARCH FIELD === */}
            <div className="col-lg-3 col-md-6">
              <label className="form-label" style={labelStyle}>
                Search
              </label>
              <div className="input-group">
                <span 
                  className="input-group-text bg-white border-end-0 text-muted"
                  style={{ borderRadius: "8px 0 0 8px", borderColor: THEME.borderColor }}
                >
                  <FiSearch />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder={searchPlaceholder}
                  value={safeSearch}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ ...inputStyle, borderRadius: "0 8px 8px 0" }}
                />
              </div>
            </div>

            {/* === DATE RANGE (OPTIONAL) === */}
            {showDate && (
              <>
                <div className="col-lg-2 col-md-6">
                  <label className="form-label" style={labelStyle}>From</label>
                  <input
                    type="date"
                    className="form-control text-secondary"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div className="col-lg-2 col-md-6">
                  <label className="form-label" style={labelStyle}>To</label>
                  <input
                    type="date"
                    className="form-control text-secondary"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            {/* === YEAR === */}
            {showYear && (
              <div className="col-lg-2 col-md-6">
                <label className="form-label" style={labelStyle}>Form</label>
                <select
                  className="form-select text-secondary"
                  value={safeYear}
                  onChange={(e) => setYear(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">All Forms</option>
                  {[1, 2, 3, 4, 5].map((y) => (
                    <option key={y} value={y}>Form {y}</option>
                  ))}
                </select>
              </div>
            )}

            {/* === CLASS === */}
            {showClass && (
              <div className="col-lg-2 col-md-6">
                <label className="form-label" style={labelStyle}>Class</label>
                <select
                  className="form-select text-secondary"
                  value={safeClassGroup}
                  onChange={(e) => setClassGroup(e.target.value)}
                  disabled={!safeYear && classOptions.length > 1}
                  style={{ 
                    ...inputStyle, 
                    backgroundColor: (!safeYear && classOptions.length > 1) ? "#f1f5f9" : "#fff" 
                  }}
                >
                  <option value="">All Classes</option>
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            )}

            {/* === SPORT === */}
            {showSport && (
              <div className="col-lg-2 col-md-6">
                <label className="form-label" style={labelStyle}>Sport</label>
                <select
                  className="form-select text-secondary"
                  value={safeSport}
                  onChange={(e) => setSport(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">All Sports</option>
                  <option value="football">Football</option>
                  <option value="volleyball">Volleyball</option>
                  <option value="sepak_takraw">Sepak Takraw</option>
                  <option value="badminton">Badminton</option>
                  <option value="netball">Netball</option>
                </select>
              </div>
            )}

            {/* === STATUS === */}
            {showStatus && (
              <div className="col-lg-2 col-md-6">
                <label className="form-label" style={labelStyle}>Status</label>
                <select
                  className="form-select text-secondary"
                  value={safeStatus}
                  onChange={(e) => setStatus(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}

            {/* === RESET BUTTON === */}
            <div className="col-lg-2 col-md-12 ms-auto">
              <button
                type="button"
                className="btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                onClick={onReset}
                style={{
                  color: THEME.indigo,
                  borderColor: THEME.indigo,
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = THEME.lightBlue;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FiRefreshCw />
                Reset
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}