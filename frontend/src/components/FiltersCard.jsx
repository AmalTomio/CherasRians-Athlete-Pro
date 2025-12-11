// src/components/FiltersCard.jsx
import React from "react";
import {
  getClassOptionsForYear,
  ALL_CLASS_GROUPS,
} from "../config/classGroups";

export default function FiltersCard({
  search,
  setSearch,
  year,
  setYear,
  classGroup,
  setClassGroup,
  sport,
  setSport,
  onFilter,
  onReset,
  showYear = true,
  showClass = true,
  showSport = true,
}) {
  // Convert null/undefined to empty strings for safe rendering
  const safeSearch = search || "";
  const safeYear = year || "";
  const safeClassGroup = classGroup || "";
  const safeSport = sport || "";

  // Get class options based on selected year
  const classOptions = getClassOptionsForYear(safeYear) || ALL_CLASS_GROUPS;

  // Handle reset click
  const handleResetClick = (e) => {
    e.preventDefault();
    if (onReset && typeof onReset === "function") {
      onReset();
    }
  };

  // Handle filter click
  const handleFilterClick = (e) => {
    e.preventDefault();
    if (onFilter && typeof onFilter === "function") {
      onFilter();
    }
  };

  return (
    <div className="card p-3 mb-4 filters-card shadow-sm">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="row g-3 align-items-end">
          {/* Search Input */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label fw-bold">Search Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter student name..."
              value={safeSearch}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search student name"
            />
          </div>

          {/* Year Filter - Conditionally Rendered */}
          {showYear && (
            <div className="col-lg-2 col-md-6">
              <label className="form-label fw-bold">Form</label>
              <select
                className="form-select"
                value={safeYear}
                onChange={(e) => setYear(e.target.value)}
                aria-label="Select form/year"
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

          {/* Class Filter - Conditionally Rendered */}
          {showClass && (
            <div className="col-lg-2 col-md-6">
              <label className="form-label fw-bold">Class</label>
              <select
                className="form-select"
                value={safeClassGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                aria-label="Select class"
                disabled={!safeYear && classOptions.length > 1}
              >
                <option value="">All Classes</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
              {!safeYear && classOptions.length > 1 && (
                <small className="form-text text-muted">
                  Select a form first
                </small>
              )}
            </div>
          )}

          {/* Sport Filter - Conditionally Rendered */}
          {showSport && (
            <div className="col-lg-3 col-md-6">
              <label className="form-label fw-bold text-primary">Sport</label>
              <select
                className="form-select"
                value={safeSport}
                onChange={(e) => setSport(e.target.value)}
                aria-label="Select sport"
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

          {/* Action Buttons */}
          <div
            className={`col-lg-${showSport ? "2" : "3"} col-md-12 d-flex gap-2`}
          >
            <button
              type="button"
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
              onClick={handleFilterClick}
              title="Apply filters"
            >
              <i className="bi bi-funnel me-2"></i>
              Filter
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
              onClick={handleResetClick}
              title="Reset all filters"
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* Active Filters Indicator */}
      {(safeSearch || safeYear || safeClassGroup || safeSport) && (
        <div className="mt-3 pt-3 border-top">
          <small className="text-muted">
            <i className="bi bi-filter me-1"></i>
            Active filters:
            {safeSearch && (
              <span className="badge bg-light text-dark ms-2">
                Name: {safeSearch}
              </span>
            )}
            {safeYear && (
              <span className="badge bg-light text-dark ms-2">
                Form: {safeYear}
              </span>
            )}
            {safeClassGroup && (
              <span className="badge bg-light text-dark ms-2">
                Class: {safeClassGroup}
              </span>
            )}
            {safeSport && (
              <span className="badge bg-light text-dark ms-2">
                Sport: {safeSport}
              </span>
            )}
          </small>
        </div>
      )}
    </div>
  );
}
