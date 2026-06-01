import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { errorAlert, successAlert } from "../../utils/swal";
import PlayerForm from "../../components/PlayerForm";
import FiltersCard from "../../components/FiltersCard";
import SkeletonTableLoader from "../../components/SkeletonTableLoader";
import "react-loading-skeleton/dist/skeleton.css";

import HeroBanner from "../../components/HeroBanner";
import {
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiFilter,
} from "react-icons/fi";

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
  const fetchPlayers = useCallback(
    async (customFilters = {}) => {
      setIsLoading(true);
      try {
        const params = {
          page: customFilters.page !== undefined ? customFilters.page : page,
          limit,
          search:
            customFilters.search !== undefined ? customFilters.search : search,
          classGroup:
            customFilters.classGroup !== undefined
              ? customFilters.classGroup
              : classGroup,
          year: customFilters.year !== undefined ? customFilters.year : year,
        };

        const res = await api.get("/coach/players", { params });

        const students = res.data.students.map((s) => ({
          _id: s._id || s.userId,
          ...s,
        }));

        setPlayers(students);
        setTotalPages(
          res.data.totalPages || Math.ceil((res.data.total || 0) / limit) || 1,
        );

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
    },
    [page, search, year, classGroup, limit, isInitialLoad],
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;

    const timeoutId = setTimeout(() => {
      setPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, year, classGroup]);

  useEffect(() => {
    if (!isInitialLoad) {
      fetchPlayers();
    }
  }, [page]);

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
      classGroup: "",
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
      successAlert("Player updated successfully!");
      fetchPlayers();
      closeModal();
    } catch (err) {
      console.error(err);
      errorAlert("Failed to update player.");
    }
  };

  // Modern Badge Styling
  const getStatusBadgeStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "active") return { bg: "#dcfce7", color: "#166534" }; // Soft Green
    if (s === "injured") return { bg: "#ffedd5", color: "#9a3412" }; // Soft Orange
    if (s === "inactive") return { bg: "#f1f5f9", color: "#475569" }; // Soft Gray
    return { bg: "#e0f2fe", color: "#0369a1" }; // Soft Blue
  };

  const formatStatusText = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  return (
    <div className="px-4 py-4">
      {/* HEADER */}
      <div className="mb-4">
        <HeroBanner
          title="My Players"
          subtitle="Manage athlete profiles and statuses"
        />
      </div>

      {/* FILTERS */}
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

      {/* DATA TABLE CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th
                  className="py-3 px-4 text-uppercase text-secondary small fw-bold"
                  style={{ letterSpacing: "1px" }}
                >
                  No
                </th>
                <th
                  className="py-3 text-uppercase text-secondary small fw-bold"
                  style={{ letterSpacing: "1px" }}
                >
                  Full Name
                </th>
                <th
                  className="py-3 text-uppercase text-secondary small fw-bold"
                  style={{ letterSpacing: "1px" }}
                >
                  Class Info
                </th>
                <th
                  className="py-3 text-uppercase text-secondary small fw-bold"
                  style={{ letterSpacing: "1px" }}
                >
                  Category
                </th>
                <th
                  className="py-3 text-uppercase text-secondary small fw-bold"
                  style={{ letterSpacing: "1px" }}
                >
                  Status
                </th>
                <th
                  className="py-3 text-end px-4 text-uppercase text-secondary small fw-bold"
                  style={{ letterSpacing: "1px" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // FIX: Render Loader DIRECTLY (No <tr>/<td> wrappers)
                <SkeletonTableLoader rows={6} />
              ) : players.length > 0 ? (
                players.map((p, idx) => {
                  const statusStyle = getStatusBadgeStyle(p.status);
                  return (
                    <tr
                      key={p._id || idx}
                      style={{ transition: "background 0.2s" }}
                    >
                      {/* NO */}
                      <td className="px-4 fw-semibold text-secondary">
                        {(page - 1) * limit + (idx + 1)}
                      </td>

                      {/* NAME (Clean Layout) */}
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-dark fs-6">
                            {p.firstName} {p.lastName}
                          </span>
                        </div>
                      </td>

                      {/* CLASS INFO */}
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-semibold text-dark">
                            {p.classGroup || "-"}
                          </span>
                          <small className="text-muted">Form {p.year}</small>
                        </div>
                      </td>

                      {/* CATEGORY & POSITION */}
                      <td>
                        <div className="d-flex flex-column">
                          <span className="badge bg-light text-dark border w-auto align-self-start mb-1">
                            {p.category || "-"}
                          </span>
                          <small className="text-muted">
                            {p.sport === "badminton"
                              ? p.badmintonCategory
                              : p.position || "N/A"}
                          </small>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className="badge rounded-pill fw-bold"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            padding: "8px 12px",
                          }}
                        >
                          <span
                            className="d-inline-block rounded-circle me-2"
                            style={{
                              width: "6px",
                              height: "6px",
                              backgroundColor: statusStyle.color,
                            }}
                          ></span>
                          {formatStatusText(p.status)}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="text-end px-4">
                        <button
                          className="btn btn-sm btn-light text-primary shadow-sm"
                          onClick={() => openEdit(p)}
                          title="Edit Player"
                          style={{
                            borderRadius: "8px",
                            width: "36px",
                            height: "36px",
                          }}
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center text-muted opacity-50">
                      <FiUsers size={48} className="mb-3" />
                      <h5 className="fw-bold">No players found</h5>
                      <p className="mb-0">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!isLoading && players.length > 0 && (
          <div className="card-footer bg-white border-top py-3 d-flex justify-content-between align-items-center px-4">
            <div className="text-muted small">
              Showing{" "}
              <span className="fw-bold text-dark">
                {(page - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="fw-bold text-dark">
                {Math.min(
                  page * limit,
                  page * limit -
                    players.length +
                    players.length +
                    (page - 1) * limit,
                )}
              </span>{" "}
              of <span className="fw-bold text-dark">{totalPages * limit}</span>{" "}
              entries
            </div>

            <nav>
              <ul className="pagination mb-0 gap-1">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link border-0 rounded-3 text-secondary"
                    onClick={() => page > 1 && setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <FiChevronLeft />
                  </button>
                </li>

                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;

                  return (
                    <li key={pageNum} className="page-item">
                      <button
                        className={`page-link border-0 rounded-3 fw-bold ${
                          page === pageNum
                            ? "shadow-sm text-white"
                            : "text-secondary"
                        }`}
                        style={{
                          backgroundColor:
                            page === pageNum ? "#6366f1" : "transparent",
                        }}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}

                <li
                  className={`page-item ${
                    page === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link border-0 rounded-3 text-secondary"
                    onClick={() => page < totalPages && setPage(page + 1)}
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
