import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import FiltersCard from "../../components/FiltersCard";
import SkeletonTableLoader from "../../components/SkeletonTableLoader"; 
import CoachPlayersModal from "../../components/exco/CoachPlayersModal"; 
import HeroBanner from "../../components/HeroBanner";

import { confirmAlert, successAlert, errorAlert } from "../../utils/swal";
import { 
  FiCalendar, 
  FiPower,
  FiUser,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

export default function Coaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sport, setSport] = useState("");
  const [status, setStatus] = useState("");

  // Modal State
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showPlayersModal, setShowPlayersModal] = useState(false);

  // --- 1. Debounce Search ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // --- 2. Fetch Coaches ---
  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const res = await api.get("/exco/coaches", {
        params: { page, limit, search: debouncedSearch, sport, status },
        headers: { "Cache-Control": "no-cache" },
      });
      
      const data = res.data.coaches || [];
      setCoaches(data);
      setTotalPages(res.data.totalPages || Math.ceil(data.length / limit) || 1);

    } catch (err) {
      console.error("Failed to load coaches", err);
      errorAlert("Failed to fetch coaches list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, [page, debouncedSearch, sport, status]);

  useEffect(() => {
    setPage(1);
  }, [sport, status]);

  // --- ACTIONS ---
  const handleToggleStatus = async (e, coach) => {
    e.stopPropagation(); // Prevent row click when clicking action button
    const action = coach.isActive ? "Retire" : "Activate";
    const color = coach.isActive ? "#ef4444" : "#10b981";

    const result = await confirmAlert.fire({
      title: `${action} Coach?`,
      text: `Are you sure you want to ${action.toLowerCase()} ${coach.firstName}?`,
      icon: "warning",
      confirmButtonText: `Yes, ${action}`,
      confirmButtonColor: color,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.put(`/exco/coaches/${coach._id}/status`, {
        isActive: !coach.isActive,
      });

      successAlert(`Coach ${coach.isActive ? "retired" : "activated"} successfully`);
      fetchCoaches(); 
    } catch (err) {
      errorAlert("Failed to update status");
    }
  };

  const handleRowClick = (coach) => {
    if (!coach.sport) {
      errorAlert("This coach is not assigned to a specific sport.");
      return;
    }
    setSelectedCoach(coach);
    setShowPlayersModal(true);
  };

  const getInitials = (f, l) => `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="px-4 py-4">
      {/* HEADER */}
      <HeroBanner 
            title="Coaches Management"
            subtitle="Overview and manage team coaches."
          />

      {/* FILTERS */}
      <FiltersCard
        search={search}
        setSearch={setSearch}
        sport={sport}
        setSport={setSport}
        status={status}
        setStatus={setStatus}
        showYear={false}
        showClass={false}
        showSport={true}
        showStatus={true}
        searchPlaceholder="Search coach name..."
        onReset={() => {
          setSearch("");
          setSport("");
          setStatus("");
          setPage(1);
        }}
      />

      {/* DATA TABLE WRAPPER */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="py-3 px-4 text-uppercase text-secondary small fw-bold" style={{ letterSpacing: "0.5px", width: "60px" }}>No</th>
                <th className="py-3 text-uppercase text-secondary small fw-bold" style={{ letterSpacing: "0.5px" }}>Coach Profile</th>
                <th className="py-3 text-uppercase text-secondary small fw-bold" style={{ letterSpacing: "0.5px" }}>Sport</th>
                <th className="py-3 text-uppercase text-secondary small fw-bold" style={{ letterSpacing: "0.5px" }}>Status</th>
                <th className="py-3 text-uppercase text-secondary small fw-bold" style={{ letterSpacing: "0.5px" }}>Joined Date</th>
                <th className="py-3 px-4 text-end text-uppercase text-secondary small fw-bold" style={{ letterSpacing: "0.5px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <SkeletonTableLoader rows={6} />
              ) : coaches.length > 0 ? (
                coaches.map((row, index) => {
                  const listNumber = (page - 1) * limit + index + 1;
                  
                  return (
                    <tr 
                      key={row._id} 
                      onClick={() => handleRowClick(row)}
                      style={{ transition: "background 0.2s", cursor: "pointer" }}
                      title="Click to view players"
                    >
                      {/* NO */}
                      <td className="py-3 px-4 fw-semibold text-secondary">
                        {listNumber}
                      </td>

                      {/* PROFILE */}
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                            style={{ 
                              width: "40px", 
                              height: "40px", 
                              background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", // Indigo
                              fontSize: "14px"
                            }}
                          >
                            {getInitials(row.firstName, row.lastName)}
                          </div>
                          <div className="d-flex flex-column">
                            <span className="fw-bold text-dark">{row.firstName} {row.lastName}</span>
                            <small className="text-muted" style={{ fontSize: "0.8rem" }}>{row.email}</small>
                          </div>
                        </div>
                      </td>

                      {/* SPORT */}
                      <td className="py-3">
                        <span className="badge bg-light text-primary border border-primary-subtle px-3 py-2 text-uppercase fw-bold">
                          {row.sport || "General"}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-3">
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            row.isActive 
                              ? "bg-success-subtle text-success border border-success-subtle" 
                              : "bg-secondary-subtle text-secondary border border-secondary-subtle"
                          }`}
                        >
                          <span 
                            className="d-inline-block rounded-circle me-2" 
                            style={{ width: "6px", height: "6px", backgroundColor: "currentColor" }}
                          />
                          {row.isActive ? "Active" : "Retired"}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="py-3">
                        <div className="text-secondary small fw-medium">
                          <FiCalendar className="me-2" />
                          {new Date(row.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 text-end px-4">
                        <button
                          className={`btn btn-sm fw-bold shadow-sm d-flex align-items-center gap-2 ms-auto ${
                            row.isActive 
                              ? "btn-outline-danger" 
                              : "btn-outline-success"
                          }`}
                          style={{ borderRadius: "8px", padding: "6px 12px" }}
                          onClick={(e) => handleToggleStatus(e, row)}
                        >
                          <FiPower size={14} />
                          {row.isActive ? "End Service" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center text-muted opacity-50">
                      <FiUser size={48} className="mb-3" />
                      <h6 className="fw-bold">No coaches found</h6>
                      <small>Try adjusting your search filters.</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        {!loading && coaches.length > 0 && (
          <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </small>

            <nav>
              <ul className="pagination mb-0 gap-1">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link border-0 rounded-3 text-secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <FiChevronLeft />
                  </button>
                </li>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                   let pNum = i + 1;
                   if (totalPages > 5 && page > 3) pNum = page - 2 + i;
                   if (pNum > totalPages) pNum = totalPages - (4 - i);
                   
                   return (
                    <li key={i} className="page-item">
                      <button
                        className={`page-link border-0 rounded-3 fw-bold ${page === pNum ? "shadow-sm text-white" : "text-secondary"}`}
                        style={{ 
                          backgroundColor: page === pNum ? "#6366f1" : "transparent",
                          width: "36px", height: "36px"
                        }}
                        onClick={() => setPage(pNum)}
                      >
                        {pNum}
                      </button>
                    </li>
                   )
                })}

                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link border-0 rounded-3 text-secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <FiChevronRight />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* Players Modal */}
      <CoachPlayersModal 
        show={showPlayersModal} 
        coach={selectedCoach} 
        onClose={() => setShowPlayersModal(false)} 
      />
    </div>
  );
}