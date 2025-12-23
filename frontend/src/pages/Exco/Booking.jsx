import { useEffect, useState } from "react";
import api from "../../api/axios";
import moment from "moment";
import { successAlert, errorAlert } from "../../utils/swal";
import Swal from "sweetalert2";

export default function Bookings() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/exco/bookings/pending");
      setRequests(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      errorAlert("Failed to fetch booking requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, approve) => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: `${approve ? "Approve" : "Reject"} Booking?`,
        text: approve
          ? "Are you sure you want to approve this booking request?"
          : "Are you sure you want to reject this booking request?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: approve ? "Yes, Approve!" : "Yes, Reject!",
        confirmButtonColor: approve ? "#28a745" : "#dc3545",
        cancelButtonColor: "#6c757d",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        // Use the correct endpoint with /approve suffix
        await api.put(`/exco/bookings/${id}/approve`, { approve });

        if (approve) {
          successAlert("Booking approved!");
        } else {
          successAlert("Booking rejected!");
        }

        fetchRequests();
      }
    } catch (err) {
      console.error("Approval error:", err);
      errorAlert(err.response?.data?.message || "Failed to update booking.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div>
      <h2 className="mb-1">Booking Requests</h2>
      <p className="text-muted mb-4">Review and approve facility bookings.</p>

      <div className="container-fluid">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading booking requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            No pending bookings at the moment.
          </div>
        ) : (
          <div className="row g-4">
            {requests.map((req) => (
              <div key={req._id} className="col-12 col-lg-6">
                <div className="card shadow-sm p-3 h-100">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="fw-bold mb-1">
                        {req.facilityId?.name || "Facility"}
                      </h5>
                      <small className="text-muted">
                        Requested by:{" "}
                        <strong>{req.coachName || "Coach"}</strong>
                      </small>
                    </div>
                    <span className="badge bg-warning">Pending</span>
                  </div>

                  <hr className="my-2" />

                  {/* Date & Time */}
                  <div className="mb-2">
                    <p className="mb-1">
                      <strong>Date:</strong>{" "}
                      {req.startAt
                        ? moment(req.startAt).format("dddd, MMM D YYYY")
                        : "N/A"}
                    </p>
                    <p className="mb-2">
                      <strong>Time:</strong>{" "}
                      {req.startAt
                        ? moment(req.startAt)
                            .tz("Asia/Kuala_Lumpur")
                            .format("h:mm A")
                        : "N/A"}{" "}
                      {req.endAt
                        ? moment(req.endAt)
                            .tz("Asia/Kuala_Lumpur")
                            .format("h:mm A")
                        : "N/A"}
                    </p>
                    {req.startAt && req.endAt && (
                      <p className="mb-2">
                        <strong>Duration:</strong>{" "}
                        {Math.round(
                          ((new Date(req.endAt) - new Date(req.startAt)) /
                            (1000 * 60 * 60)) *
                            10
                        ) / 10}{" "}
                        hours
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="mb-2">
                    <p className="mb-1">
                      <strong>Reason:</strong>
                    </p>
                    <p className="text-muted mb-2">
                      {req.reason || "Not specified"}
                    </p>
                  </div>

                  {/* Equipment */}
                  <div className="mb-3">
                    <p className="mb-1">
                      <strong>Equipment Requested:</strong>
                    </p>
                    {req.equipmentRequests?.length > 0 ? (
                      <ul className="list-group list-group-flush small">
                        {req.equipmentRequests.map((eq, i) => (
                          <li key={i} className="list-group-item px-0 py-1">
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{eq.equipmentName}</span>
                              <span className="badge bg-secondary">
                                {eq.quantity} pcs
                              </span>
                            </div>
                            {eq.reason && (
                              <div className="text-muted small mt-1">
                                Reason: {eq.reason}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted small mb-0">
                        No equipment requested
                      </p>
                    )}
                  </div>

                  {/* Request Info */}
                  <div className="mt-auto">
                    <div className="small text-muted border-top pt-2">
                      <div>
                        <strong>Requested:</strong>{" "}
                        {req.createdAt
                          ? moment(req.createdAt)
                              .tz("Asia/Kuala_Lumpur")
                              .format("MMM D, h:mm A")
                          : "N/A"}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="d-flex gap-2 justify-content-end mt-3">
                      <button
                        className="btn btn-outline-danger"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
