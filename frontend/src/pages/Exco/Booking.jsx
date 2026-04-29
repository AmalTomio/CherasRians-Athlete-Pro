import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import moment from "moment";
import Swal from "sweetalert2";
import { formatStatus, capitalizeFirst } from "../../utils/format";
import { successAlert, errorAlert } from "../../utils/swal";
import FiltersCard from "../../components/FiltersCard";
import Table from "../../components/Table";
import SkeletonTableLoader from "../../components/SkeletonTableLoader";
import HeroBanner from "../../components/HeroBanner";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

export default function Bookings() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  const [historyBookings, setHistoryBookings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyTab, setHistoryTab] = useState("approved"); 
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);


  const fetchPending = async () => {
    try {
      setLoadingPending(true);
      const res = await api.get("/exco/bookings/pending");
      setPendingBookings(res.data.bookings || []);
    } catch {
      console.error("Failed pending fetch");
    } finally {
      setLoadingPending(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const statusParam =
        historyTab === "approved" ? "approved" : "rejected,cancelled";

      const res = await api.get("/exco/bookings", {
        params: {
          page,
          limit,
          search: debouncedSearch,
          status: statusParam,
        },
      });

      setHistoryBookings(res.data.bookings || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      errorAlert("Failed to fetch booking history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [page, debouncedSearch, historyTab]);

  useEffect(() => {
    setPage(1);
  }, [historyTab]);

  const handleDecision = async (id, approve) => {
    const result = await Swal.fire({
      title: `${approve ? "Approve" : "Reject"} Booking?`,
      text: "You can't revert this action easily.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: approve ? "Yes, Approve" : "Yes, Reject",
      confirmButtonColor: approve ? "#10b981" : "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/exco/bookings/${id}/approve`, { approve });
      successAlert(`Booking ${approve ? "approved" : "rejected"}`);
      fetchPending();
      fetchHistory();
    } catch {
      errorAlert("Failed to update booking.");
    }
  };

 
  const displayedPending = useMemo(() => {
    if (!debouncedSearch) return pendingBookings;
    const q = debouncedSearch.toLowerCase();
    return pendingBookings.filter(
      (b) =>
        b.facilityId?.name?.toLowerCase().includes(q) ||
        b.coachName?.toLowerCase().includes(q),
    );
  }, [pendingBookings, debouncedSearch]);

  const columns = [
    {
      label: "Facility Info",
      key: "facility",
      accessor: (row) => (
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm"
            style={{
              width: "40px",
              height: "40px",
              background:
                historyTab === "approved"
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                  : "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
              fontSize: "18px",
            }}
          >
            <FiMapPin />
          </div>
          <div>
            <div className="fw-bold text-dark">
              {row.facilityId?.name || "Unknown Facility"}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Schedule",
      key: "schedule",
      accessor: (row) => (
        <div className="d-flex flex-column">
          <span className="fw-bold text-dark d-flex align-items-center gap-2">
            <FiCalendar className="text-muted" size={14} />
            {moment(row.startAt).format("MMM D, YYYY")}
          </span>
          <small className="text-muted ms-4">
            {moment(row.startAt).format("h:mm A")} -{" "}
            {moment(row.endAt).format("h:mm A")}
          </small>
        </div>
      ),
    },
    {
      label: "Coach",
      key: "coach",
      accessor: (row) => (
        <div className="d-flex align-items-center gap-2 text-dark fw-medium">
          <FiUser className="text-muted" /> {row.coachName}
        </div>
      ),
    },
    {
      label: "Reason",
      key: "reason",
      accessor: (row) => (
        <span
          className="text-muted small text-truncate d-inline-block"
          style={{ maxWidth: "200px" }}
        >
          {row.reason ? capitalizeFirst(row.reason) : "No reason provided"}
        </span>
      ),
    },
    {
      label: "Status",
      key: "status",
      className: "text-end px-4",
      accessor: (row) => {
        const isApproved = row.status === "approved";
        const isRejected = row.status === "rejected";

        let badgeClass =
          "bg-secondary-subtle text-secondary border-secondary-subtle";
        let Icon = FiClock;

        if (isApproved) {
          badgeClass = "bg-success-subtle text-success border-success-subtle";
          Icon = FiCheckCircle;
        } else if (isRejected) {
          badgeClass = "bg-danger-subtle text-danger border-danger-subtle";
          Icon = FiXCircle;
        }

        return (
          <span
            className={`badge border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 ${badgeClass}`}
          >
            <Icon />
            {formatStatus(row.status)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="px-4 py-4">

      <HeroBanner
        title="Booking Management"
        subtitle="Review booking requests and view booking history."
        buttonText="Export Report"
             />

      

      <FiltersCard
        search={search}
        setSearch={setSearch}
        showYear={false}
        showClass={false}
        showSport={false}
        searchPlaceholder="Search facility or coach..."
        onReset={() => setSearch("")}
      />

      <div className="mb-5">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <div
            className="spinner-grow text-warning spinner-grow-sm"
            role="status"
          />
          Pending Requests ({displayedPending.length})
        </h5>

        {loadingPending ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : displayedPending.length === 0 ? (
          <div className="alert alert-light border shadow-sm text-muted d-flex align-items-center gap-3">
            <FiCheckCircle className="text-success" size={20} />
            No pending booking requests found.
          </div>
        ) : (
          <div className="row g-4">
            {displayedPending.map((req) => (
              <div key={req._id} className="col-12 col-xl-6">
                <div
                  className="card shadow-sm border-0 h-100"
                  style={{ borderRadius: "12px", overflow: "hidden" }}
                >
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="fw-bold text-dark mb-1">
                          {req.facilityId?.name}
                        </h5>
                        <div className="text-primary fw-medium small">
                          <FiUser className="me-1" /> Coach {req.coachName}
                        </div>
                      </div>
                      <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-pill">
                        Pending
                      </span>
                    </div>

                    <div className="bg-light p-3 rounded-3 mb-3 border">
                      <div className="d-flex gap-4 mb-2">
                        <div className="d-flex align-items-center gap-2 text-secondary small">
                          <FiCalendar />{" "}
                          {moment(req.startAt).format("MMM D, YYYY")}
                        </div>
                        <div className="d-flex align-items-center gap-2 text-secondary small">
                          <FiClock /> {moment(req.startAt).format("h:mm A")} –{" "}
                          {moment(req.endAt).format("h:mm A")}
                        </div>
                      </div>
                      <p className="text-muted small m-0 fst-italic">
                        "
                        {req.reason
                          ? capitalizeFirst(req.reason)
                          : "No reason provided"}
                        "
                      </p>
                    </div>

                    <div className="d-flex gap-2 mt-auto pt-2">
                      <button
                        className="btn btn-outline-danger flex-fill fw-bold"
                        onClick={() => handleDecision(req._id, false)}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-success flex-fill fw-bold shadow-sm"
                        onClick={() => handleDecision(req._id, true)}
                        style={{
                          background:
                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          border: "none",
                        }}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold text-dark m-0">Booking History</h5>

        <div className="bg-light p-1 rounded-pill d-inline-flex border">
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
              historyTab === "approved"
                ? "bg-white text-success shadow-sm"
                : "text-muted hover-dark"
            }`}
            onClick={() => setHistoryTab("approved")}
          >
            Approved
          </button>
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
              historyTab === "rejected"
                ? "bg-white text-danger shadow-sm"
                : "text-muted hover-dark"
            }`}
            onClick={() => setHistoryTab("rejected")}
          >
            Rejected
          </button>
        </div>
      </div>

      <div
        className="card border-0 shadow-sm rounded-4 overflow-hidden"
       
      >
        <div className="table-responsive">
          <Table
            columns={columns}
            data={historyBookings}
            loading={loadingHistory}
            customSkeleton={<SkeletonTableLoader rows={5} />}
          />
        </div>

        {!loadingHistory && historyBookings.length > 0 && (
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
                          backgroundColor:
                            page === pNum ? "#6366f1" : "transparent",
                          width: "36px",
                          height: "36px",
                        }}
                        onClick={() => setPage(pNum)}
                      >
                        {pNum}
                      </button>
                    </li>
                  );
                })}

                <li
                  className={`page-item ${page === totalPages ? "disabled" : ""}`}
                >
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
    </div>
  );
}
