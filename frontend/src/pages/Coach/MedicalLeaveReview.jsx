import { useEffect, useState } from "react";
import api from "../../api/axios";
import { successAlert, errorAlert, confirmAlert } from "../../utils/swal";
import moment from "moment";

const MedicalLeaveReview = () => {
  const [leaves, setLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [coachRemarks, setCoachRemarks] = useState("");

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/medical/coach/pending");
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error("Fetch pending leaves error:", err);
      errorAlert("Failed to load pending medical leaves");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveDetails = async (leaveId) => {
    try {
      const res = await api.get(`/api/medical/details/${leaveId}`);
      setSelectedLeave(res.data);
    } catch (err) {
      console.error("Fetch leave details error:", err);
      errorAlert("Failed to load leave details");
    }
  };

  const handleReview = async (leaveId, status) => {
    try {
      const result = await confirmAlert.fire({
        title: `${status} Medical Leave?`,
        text: status === "Approved" 
          ? "Are you sure you want to approve this medical leave?"
          : "Are you sure you want to reject this medical leave?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: status === "Approved" ? "Yes, Approve" : "Yes, Reject",
        confirmButtonColor: status === "Approved" ? "#28a745" : "#dc3545",
        input: "textarea",
        inputLabel: "Remarks (optional)",
        inputPlaceholder: "Enter remarks for the student...",
        inputValidator: () => {
          return null;
        }
      });

      if (result.isConfirmed) {
        setReviewLoading(true);
        await api.patch(`/api/medical/coach/${leaveId}`, {
          status,
          coachRemarks: result.value || ""
        });

        successAlert(`Medical leave ${status.toLowerCase()} successfully!`);
        
        // Refresh data
        fetchPendingLeaves();
        if (selectedLeave && selectedLeave._id === leaveId) {
          setSelectedLeave(null);
        }
      }
    } catch (err) {
      console.error("Review error:", err);
      errorAlert(err.response?.data?.message || "Failed to update medical leave");
    } finally {
      setReviewLoading(false);
    }
  };

  const viewFile = async (leaveId) => {
    try {
      const response = await api.get(`/api/medical/file/${leaveId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
    } catch (err) {
      console.error("View file error:", err);
      errorAlert("Failed to open medical certificate");
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading medical leave applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Medical Leave Applications</h2>
        <p className="text-muted">Review and verify student medical leave applications</p>
      </div>

      <div className="row">
        {/* Left Column - Pending Applications List */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-warning text-white">
              <h5 className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Pending Applications ({leaves.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {leaves.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
                  <p className="mt-3 text-muted">No pending medical leave applications</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {leaves.map((leave) => (
                    <div 
                      key={leave._id} 
                      className={`list-group-item list-group-item-action ${selectedLeave?._id === leave._id ? 'active' : ''}`}
                      onClick={() => fetchLeaveDetails(leave._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{leave.userId?.firstName} {leave.userId?.lastName}</h6>
                          <small className="text-muted">
                            {leave.userId?.staffId} • {leave.userId?.sport} Team
                          </small>
                        </div>
                        <div className="text-end">
                          <div className="small">
                            {moment(leave.startDate).format("MMM D")} - {moment(leave.endDate).format("MMM D")}
                          </div>
                          <div className="badge bg-secondary">
                            {leave.duration} day{leave.duration > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Leave Details */}
        <div className="col-lg-6">
          {selectedLeave ? (
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Medical Leave Details</h5>
              </div>
              <div className="card-body">
                {/* Student Info */}
                <div className="mb-4">
                  <h6 className="fw-bold">{selectedLeave.studentName}</h6>
                  <p className="text-muted mb-2">
                    {selectedLeave.studentId} • {selectedLeave.team}
                  </p>
                </div>

                {/* Leave Period */}
                <div className="mb-3">
                  <h6 className="fw-bold">Leave Period</h6>
                  <p className="mb-1">
                    {moment(selectedLeave.startDate).format("dddd, MMMM D, YYYY")} - {moment(selectedLeave.endDate).format("dddd, MMMM D, YYYY")}
                  </p>
                  <span className="badge bg-info">
                    {selectedLeave.duration} day{selectedLeave.duration > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Reason */}
                <div className="mb-3">
                  <h6 className="fw-bold">Reason</h6>
                  <p>{selectedLeave.reason || "No reason provided"}</p>
                </div>

                {/* Medical Certificate */}
                <div className="mb-4">
                  <h6 className="fw-bold">Medical Certificate</h6>
                  <div className="d-flex align-items-center justify-content-between border rounded p-3">
                    <div>
                      <i className="bi bi-file-earmark-medical text-primary me-2"></i>
                      <span>{selectedLeave.fileName}</span>
                      <div className="small text-muted">
                        {Math.round(selectedLeave.fileSize / 1024)} KB • {selectedLeave.fileType}
                      </div>
                    </div>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => viewFile(selectedLeave._id)}
                    >
                      <i className="bi bi-eye me-1"></i> View
                    </button>
                  </div>
                </div>

                {/* Submitted Info */}
                <div className="small text-muted mb-4">
                  <div>
                    <i className="bi bi-clock me-1"></i>
                    Submitted: {moment(selectedLeave.submittedAt).format("MMM D, YYYY h:mm A")}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success flex-grow-1"
                    onClick={() => handleReview(selectedLeave._id, "Approved")}
                    disabled={reviewLoading}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Approve
                  </button>
                  <button
                    className="btn btn-danger flex-grow-1"
                    onClick={() => handleReview(selectedLeave._id, "Rejected")}
                    disabled={reviewLoading}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-file-earmark-text" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
                <p className="mt-3 text-muted">
                  Select a medical leave application from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalLeaveReview;