import React from "react";
import {
  getClassOptionsForYear,
  ALL_CLASS_GROUPS,
} from "../config/classGroups";
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

  // CATEGORY (Added for Exco/Coach)
  category = "",
  setCategory = () => {},

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
  showCategory = false, // New flag
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
  const safeCategory = category || "";
  const safeStatus = status || "";

  const classOptions = getClassOptionsForYear(safeYear) || ALL_CLASS_GROUPS;

  return (
    <div className="card border-0 shadow-sm mb-4 filter-card-wrapper">
      <div className="card-body p-4">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="row g-3 align-items-end">
            
            {/* === SEARCH FIELD === */}
            <div className="col-lg-3 col-md-6">
              <label className="filter-label text-primary">Search</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted filter-input-radius-left">
                  <FiSearch />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0 filter-input filter-input-radius-right shadow-none"
                  placeholder={searchPlaceholder}
                  value={safeSearch}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* === DATE RANGE === */}
            {showDate && (
              <>
                <div className="col-lg-2 col-md-6">
                  <label className="filter-label text-primary">From</label>
                  <input
                    type="date"
                    className="form-control filter-input text-secondary shadow-none"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-lg-2 col-md-6">
                  <label className="filter-label text-primary">To</label>
                  <input
                    type="date"
                    className="form-control filter-input text-secondary shadow-none"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* === YEAR === */}
            {showYear && (
              <div className="col-lg-2 col-md-6">
                <label className="filter-label text-primary">Form</label>
                <select
                  className="form-select filter-input text-secondary shadow-none"
                  value={safeYear}
                  onChange={(e) => setYear(e.target.value)}
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
                <label className="filter-label text-primary">Class</label>
                <select
                  className="form-select filter-input text-secondary shadow-none"
                  value={safeClassGroup}
                  onChange={(e) => setClassGroup(e.target.value)}
                  disabled={!safeYear && classOptions.length > 1}
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
                <label className="filter-label text-primary">Sport</label>
                <select
                  className="form-select filter-input text-secondary shadow-none"
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

            {/* === CATEGORY (U-15 / U-18) === */}
            {showCategory && (
              <div className="col-lg-2 col-md-6">
                <label className="filter-label text-primary">Category</label>
                <select
                  className="form-select filter-input text-secondary shadow-none"
                  value={safeCategory}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="U-15">U-15 Squad</option>
                  <option value="U-18">U-18 Squad</option>
                </select>
              </div>
            )}

            {/* === STATUS === */}
            {showStatus && (
              <div className="col-lg-2 col-md-6">
                <label className="filter-label text-primary">Status</label>
                <select
                  className="form-select filter-input text-secondary shadow-none"
                  value={safeStatus}
                  onChange={(e) => setStatus(e.target.value)}
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
                className="btn btn-outline-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-2 filter-btn-reset"
                onClick={onReset}
              >
                <FiRefreshCw />
                Reset
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* Scoped CSS classes instead of messy inline styles */}
      <style>{`
        .filter-card-wrapper {
          border-top: 4px solid #0d6efd !important;
          border-radius: 12px;
        }
        .filter-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          display: block;
        }
        .filter-input {
          font-size: 0.9rem;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .filter-input:focus {
          border-color: #0d6efd;
        }
        .filter-input:disabled {
          background-color: #f8f9fa;
        }
        .filter-input-radius-left {
          border-radius: 8px 0 0 8px;
        }
        .filter-input-radius-right {
          border-radius: 0 8px 8px 0;
        }
        .filter-btn-reset {
          padding: 10px;
          border-radius: 8px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}