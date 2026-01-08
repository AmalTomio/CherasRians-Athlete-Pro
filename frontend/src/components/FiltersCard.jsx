// components/FiltersCard.jsx
import React from "react";
import {
  getClassOptionsForYear,
  ALL_CLASS_GROUPS,
} from "../config/classGroups";

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

  searchPlaceholder = "Enter name...",
}) {
  const safeSearch = search || "";
  const safeYear = year || "";
  const safeClassGroup = classGroup || "";
  const safeSport = sport || "";
  const safeStatus = status || "";

  const classOptions = getClassOptionsForYear(safeYear) || ALL_CLASS_GROUPS;

  return (
    <div className="card p-3 mb-4 shadow-sm">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="row g-3 align-items-end">
          {/* SEARCH */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label fw-bold">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder={searchPlaceholder}
              value={safeSearch}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* DATE FILTER (OPTIONAL) */}
          {showDate && (
            <>
              <div className="col-lg-2 col-md-6">
                <label className="form-label fw-bold">From</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="col-lg-2 col-md-6">
                <label className="form-label fw-bold">To</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          {/* YEAR */}
          {showYear && (
            <div className="col-lg-2 col-md-6">
              <label className="form-label fw-bold">Form</label>
              <select
                className="form-select"
                value={safeYear}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">All Forms</option>
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    Form {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CLASS */}
          {showClass && (
            <div className="col-lg-2 col-md-6">
              <label className="form-label fw-bold">Class</label>
              <select
                className="form-select"
                value={safeClassGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                disabled={!safeYear && classOptions.length > 1}
              >
                <option value="">All Classes</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SPORT */}
          {showSport && (
            <div className="col-lg-2 col-md-6">
              <label className="form-label fw-bold">Sport</label>
              <select
                className="form-select"
                value={safeSport}
                onChange={(e) => setSport(e.target.value)}
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

          {/* STATUS */}
          {showStatus && (
            <div className="col-lg-2 col-md-6">
              <label className="form-label fw-bold">Status</label>
              <select
                className="form-select"
                value={safeStatus}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* ACTIONS */}
          <div className="col-lg-3 col-md-12 d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={onReset}
            >
              <i className="bi bi-arrow-clockwise me-2" />
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
