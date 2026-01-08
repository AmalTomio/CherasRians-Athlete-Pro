// exco/Bookings.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import moment from "moment";
import Swal from "sweetalert2";
import { formatStatus } from "../../utils/format";

import { successAlert, errorAlert } from "../../utils/swal";
import FiltersCard from "../../components/FiltersCard";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/exco/bookings");
      setBookings(res.data.bookings || []);
    } catch (err) {
      errorAlert("Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDecision = async (id, approve) => {
    const result = await Swal.fire({
      title: `${approve ? "Approve" : "Reject"} Booking?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: approve ? "Approve" : "Reject",
      confirmButtonColor: approve ? "#16a34a" : "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/exco/bookings/${id}/approve`, { approve });
      successAlert(`Booking ${approve ? "approved" : "rejected"}`);
      fetchBookings();
    } catch {
      errorAlert("Failed to update booking.");
    }
  };

  // ===== FILTER LOGIC =====
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();

    const matchSearch =
      !search ||
      b.facilityId?.name?.toLowerCase().includes(q) ||
      b.coachName?.toLowerCase().includes(q);

    const matchStatus = !status || b.status === status;

    const matchStart =
      !startDate || moment(b.startAt).isSameOrAfter(startDate, "day");

    const matchEnd =
      !endDate || moment(b.startAt).isSameOrBefore(endDate, "day");

    return matchSearch && matchStatus && matchStart && matchEnd;
  });

  const pending = filtered.filter((b) => b.status === "pending");
  const history = filtered.filter((b) => b.status !== "pending");

  return (
    <div>
      <h2 className="mb-1">Booking Management</h2>
      <p className="text-muted mb-4">
        Review booking requests and view booking history
      </p>

      {/* FILTERS */}
      <FiltersCard
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        showYear={false}
        showClass={false}
        showSport={false}
        showStatus
        showDate
        searchPlaceholder="Search facility or coach..."
        onReset={() => {
          setSearch("");
          setStatus("");
          setStartDate("");
          setEndDate("");
        }}
      />

      {/* ===== PENDING BOOKINGS ===== */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : pending.length === 0 ? (
        <div className="alert alert-info">No pending bookings found</div>
      ) : (
        <div className="row g-4">
          {pending.map((req) => (
            <div key={req._id} className="col-lg-6">
              <div className="card shadow-sm p-3 h-100">
                <div className="d-flex justify-content-between mb-2">
                  <h5 className="fw-bold">{req.facilityId?.name}</h5>
                  <span className="badge bg-warning">
                    {formatStatus(req.status)}
                  </span>
                </div>

                <div className="text-muted small mb-2">
                  Coach: <strong>{req.coachName}</strong>
                </div>

                <div className="mb-2">
                  {moment(req.startAt).format("MMM D YYYY")} <br />
                  {moment(req.startAt).format("h:mm A")} –{" "}
                  {moment(req.endAt).format("h:mm A")}
                </div>

                <p className="text-muted">{req.reason}</p>

                <div className="text-end mt-auto">
                  <button
                    className="btn btn-outline-danger me-2"
                    onClick={() => handleDecision(req._id, false)}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => handleDecision(req._id, true)}
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== DIVIDER ===== */}
      <div className="d-flex align-items-center my-5">
        <div className="flex-grow-1 border-top"></div>
        <span className="mx-3 text-muted fw-semibold">Booking History</span>
        <div className="flex-grow-1 border-top"></div>
      </div>

      {/* ===== HISTORY TABLE ===== */}
      <div className="card shadow-sm">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Facility</th>
              <th>Date & Time</th>
              <th>Coach</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">
                  No booking history
                </td>
              </tr>
            ) : (
              history.map((b) => (
                <tr key={b._id}>
                  <td>{b.facilityId?.name}</td>
                  <td>
                    {moment(b.startAt).format("MMM D YYYY")}
                    <div className="text-muted small">
                      {moment(b.startAt).format("h:mm A")} –{" "}
                      {moment(b.endAt).format("h:mm A")}
                    </div>
                  </td>
                  <td>{b.coachName}</td>
                  <td>
                    <span
                      className={`badge ${
                        b.status === "approved"
                          ? "bg-success"
                          : bookings.status === "rejected"
                          ? "bg-danger"
                          : b.status === "cancelled"
                          ? "bg-secondary"
                          : "bg-warning"
                      }`}
                    >
                      {formatStatus(b.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
