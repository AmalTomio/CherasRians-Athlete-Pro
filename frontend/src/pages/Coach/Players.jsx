// src/pages/Coach/Players.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { errorAlert, successAlert } from "../../utils/swal";
import PlayerForm from "../../components/PlayerForm";
import FiltersCard from "../../components/FiltersCard";
import SkeletonTableLoader from "../../components/SkeletonTableLoader";
import Skeleton from "react-loading-skeleton"; // ADD THIS IMPORT
import "react-loading-skeleton/dist/skeleton.css"; // ADD THIS IMPORT

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [classGroup, setClassGroup] = useState("");

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const limit = 10;

  // Memoized fetch function
  const fetchPlayers = useCallback(async (customFilters = {}) => {
    setIsLoading(true);
    try {
      const params = {
        page: customFilters.page !== undefined ? customFilters.page : page,
        limit,
        search: customFilters.search !== undefined ? customFilters.search : search,
        classGroup: customFilters.classGroup !== undefined ? customFilters.classGroup : classGroup,
        year: customFilters.year !== undefined ? customFilters.year : year,
      };

      const res = await api.get("/coach/players", { params });

      const students = res.data.students.map((s) => ({
        _id: s._id || s.userId,
        ...s,
      }));

      setPlayers(students);
      setTotalPages(res.data.totalPages || Math.ceil((res.data.total || 0) / limit) || 1);
      
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (err) {
      console.error(err);
      if (!isInitialLoad) {
        errorAlert("Failed to fetch players.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, search, year, classGroup, limit, isInitialLoad]);

  // Initial fetch on mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  // Debounced fetch when filters change
  useEffect(() => {
    if (isInitialLoad) return;
    
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchPlayers({ page: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, year, classGroup, fetchPlayers, isInitialLoad]);

  // Fetch when page changes
  useEffect(() => {
    if (!isInitialLoad) {
      fetchPlayers();
    }
  }, [page, fetchPlayers, isInitialLoad]);

  const handleFilter = () => {
    setPage(1);
    fetchPlayers({ page: 1 });
  };

  const handleReset = () => {
    setSearch("");
    setYear("");
    setClassGroup("");
    setPage(1);
    fetchPlayers({ 
      page: 1, 
      search: "", 
      year: "", 
      classGroup: "" 
    });
  };

  const openEdit = (player) => {
    const fixedPlayer = { ...player, userId: player.userId || player._id };
    setSelectedPlayer(fixedPlayer);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedPlayer(null);
    setShowModal(false);
  };

  const handleSave = async (id, payload) => {
    try {
      await api.put(`/coach/players/${id}`, payload);
      successAlert("Player updated!");
      fetchPlayers();
      closeModal();
    } catch (err) {
      console.error(err);
      errorAlert("Failed to update player.");
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower === "active") return "bg-success";
    if (statusLower === "injured") return "bg-warning";
    if (statusLower === "inactive") return "bg-secondary";
    return "bg-info";
  };

  const formatStatusText = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  return (
    <div>
      <h2 className="mb-4">My Players</h2>

      <FiltersCard
        search={search}
        setSearch={setSearch}
        year={year}
        setYear={setYear}
        classGroup={classGroup}
        setClassGroup={setClassGroup}
        sport=""
        setSport={() => {}}
        onFilter={handleFilter}
        onReset={handleReset}
        showYear={true}
        showClass={true}
        showSport={false}
      />

      <div className="card p-3">
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            {isLoading ? (
              <SkeletonTableLoader rows={6} />
            ) : (
              <>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Year</th>
                    <th>Class</th>
                    <th>Category</th>
                    <th>Position / Event</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.length > 0 ? (
                    players.map((p, idx) => (
                      <tr key={p._id || idx}>
                        <td className="fw-semibold">{(page - 1) * limit + (idx + 1)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="ms-2">
                              <div className="fw-medium">{p.firstName} {p.lastName}</div>
                              {p.email && (
                                <small className="text-muted">{p.email}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{p.year || "-"}</td>
                        <td>{p.classGroup || "-"}</td>
                        <td>{p.category || "-"}</td>
                        <td>
                          {p.sport === "badminton" 
                            ? (p.badmintonCategory || "-") 
                            : (p.position || "-")}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(p.status)}`}>
                            {formatStatusText(p.status)}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-warning btn-sm" 
                            onClick={() => openEdit(p)}
                            title="Edit player details"
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="text-muted">
                          <i className="bi bi-people display-6"></i>
                          <p className="mt-2 mb-0">No players found</p>
                          <small className="text-muted">
                            {search || year || classGroup 
                              ? "Try adjusting your filters" 
                              : "No players in the system"}
                          </small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>

        {/* Skeleton Pagination during loading */}
        {isLoading ? (
          <div className="d-flex justify-content-center mt-4">
            <div className="d-flex align-items-center gap-2">
              <Skeleton width={100} height={36} borderRadius={6} />
              <Skeleton width={30} height={36} borderRadius={6} />
              <Skeleton width={30} height={36} borderRadius={6} />
              <Skeleton width={30} height={36} borderRadius={6} />
              <Skeleton width={30} height={36} borderRadius={6} />
              <Skeleton width={100} height={36} borderRadius={6} />
            </div>
          </div>
        ) : players.length > 0 && (
          <div className="d-flex justify-content-center align-items-center mt-4">
            <div className="d-flex align-items-center me-3">
              <span className="text-muted me-2">Page</span>
              <span className="fw-semibold">{page} of {totalPages}</span>
            </div>
            
            <ul className="pagination mb-0">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button 
                  className="page-link" 
                  onClick={() => page > 1 && setPage(page - 1)}
                  disabled={page === 1}
                >
                  <i className="bi bi-chevron-left"></i> Previous
                </button>
              </li>

              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <li key={pageNum} className={`page-item ${page === pageNum ? "active" : ""}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}

              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button 
                  className="page-link" 
                  onClick={() => page < totalPages && setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
            
            <div className="ms-3 text-muted">
              <small>Total: {players.length} players on this page</small>
            </div>
          </div>
        )}
      </div>

      {showModal && selectedPlayer && (
        <PlayerForm 
          player={selectedPlayer} 
          onClose={closeModal} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}