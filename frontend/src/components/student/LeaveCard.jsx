import React from "react";
import { Card, Button } from "react-bootstrap";
import {
  FileEarmarkText,
  CheckCircle,
  XCircle,
  ExclamationCircle,
  Trash,
} from "react-bootstrap-icons";
import Swal from "sweetalert2";

const LeaveCard = ({ leave, role, onDelete, onViewMC, onReview }) => {
  const confirmDelete = () => {
    Swal.fire({
      title: "Delete this application?",
      text: "You cannot undo this action.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) onDelete(leave._id);
    });
  };

  const icons = {
    Approved: <CheckCircle size={20} className="text-success" />,
    Rejected: <XCircle size={20} className="text-danger" />,
    Pending: <ExclamationCircle size={20} className="text-warning" />,
  };

  const statusBadge = {
    Approved: "badge bg-success",
    Rejected: "badge bg-danger",
    Pending: "badge bg-warning text-dark",
  };

  return (
    <Card className="p-4 shadow-sm mb-3 rounded-4 border position-relative">
      {/* STUDENT DELETE (PENDING ONLY) */}
      {role === "student" && leave.status === "Pending" && (
        <Button
          variant="danger"
          size="sm"
          className="position-absolute"
          style={{
            top: "18px",
            right: "18px",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
          }}
          onClick={confirmDelete}
        >
          <Trash size={16} />
        </Button>
      )}

      {/* HEADER */}
      <div className="d-flex align-items-center gap-3 mb-2">
        {icons[leave.status]}
        <h5 className="mb-0">
          {leave.studentName} ({leave.studentId})
        </h5>
        <span className={`${statusBadge[leave.status]} px-3 py-2`}>
          {leave.status}
        </span>
      </div>

      <p className="text-muted mb-1">{leave.team}</p>

      {/* PERIOD */}
      <div className="row mt-3">
        <div className="col-md-6">
          <small className="text-muted">Leave Period:</small>
          <p>
            {new Date(leave.startDate).toLocaleDateString()} –{" "}
            {new Date(leave.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="col-md-6">
          <small className="text-muted">Duration:</small>
          <p>{leave.duration || 1} days</p>
        </div>
      </div>

      {/* REASON */}
      <div className="mt-3">
        <small className="text-muted">Reason:</small>
        <p>{leave.reason}</p>
      </div>

      {/* MC FILE */}
      <div className="p-3 rounded-3 border bg-light mt-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <FileEarmarkText size={22} className="text-primary" />
            <div>
              <strong>{leave.fileName}</strong>
              <p className="text-muted mb-0">
                Uploaded: {new Date(leave.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Button variant="primary" onClick={() => onViewMC(leave._id)}>
            View MC
          </Button>
        </div>
      </div>

      {/* COACH ACTIONS */}
      {role === "coach" && leave.status === "Pending" && (
        <div className="d-flex gap-2 mt-4">
          <Button
            variant="success"
            onClick={() => onReview(leave._id, "Approved")}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            onClick={() => onReview(leave._id, "Rejected")}
          >
            Reject
          </Button>
        </div>
      )}

      {/* VERIFICATION INFO */}
      {leave.status !== "Pending" && (
        <div className="mt-4 border-top pt-3">
          <div className="d-flex gap-5 text-muted">
            <span>Verified by: {leave.coachName}</span>
            <span>
              Date:{" "}
              {leave.verifiedAt
                ? new Date(leave.verifiedAt).toLocaleDateString()
                : "-"}
            </span>
          </div>

          {leave.coachRemarks && (
            <div className="mt-2">
              <small className="text-muted">Coach Remarks:</small>
              <p>{leave.coachRemarks}</p>
            </div>
          )}
        </div>
      )}

      <div className="text-muted mt-2">
        <small>
          Submitted: {new Date(leave.submittedAt).toLocaleDateString()}
        </small>
      </div>
    </Card>
  );
};

export default LeaveCard;
