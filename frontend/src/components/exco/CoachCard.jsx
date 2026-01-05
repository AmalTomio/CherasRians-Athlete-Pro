import Avatar from "../Avatar";
import api from "../../api/axios";
import { confirmAlert, successAlert, errorAlert } from "../../utils/swal";

export default function CoachCard({ coach, onUpdated }) {
  const { _id, firstName, lastName, email, sport, isActive, createdAt } = coach;

  const fullName = `${firstName} ${lastName}`;

  const handleToggleStatus = async () => {
    const result = await confirmAlert.fire({
      title: isActive ? "Retire Coach?" : "Activate Coach?",
      text: isActive
        ? "This coach will no longer be active."
        : "This coach will be set as active.",
      icon: "warning",
    });

    if (!result.isConfirmed) return;

    try {
      // ✅ single API call
      const res = await api.put(`/exco/coaches/${_id}/status`, {
        isActive: !isActive,
      });

      successAlert("Coach status updated");

      // ✅ immediately update parent state
      onUpdated?.(res.data.coach);

    } catch (err) {
      errorAlert("Failed to update coach status");
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      {/* ===== HEADER ===== */}
      <div
        className="p-3 rounded-top-4 text-white"
        style={{
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
        }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <Avatar name={fullName} />

          <span
            className={`badge rounded-pill px-3 py-2 ${
              isActive ? "bg-success" : "bg-secondary"
            }`}
          >
            {isActive ? "Active" : "Retired"}
          </span>
        </div>

        <h5 className="mt-3 mb-0 fw-semibold">{fullName}</h5>
        <small className="opacity-75">
          {sport ? sport.charAt(0).toUpperCase() + sport.slice(1) : "—"}
        </small>
      </div>

      {/* ===== BODY ===== */}
      <div className="card-body d-flex flex-column gap-3">
        {/* EMAIL */}
        <div className="d-flex align-items-center gap-2 small">
          <i className="bi bi-envelope text-primary"></i>
          <span
            className="text-truncate"
            style={{
              maxWidth: "100%",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              display: "block",
            }}
          >
            {email}
          </span>
        </div>

        {/* JOIN DATE */}
        <div className="d-flex align-items-center gap-2 small">
          <i className="bi bi-calendar text-primary"></i>
          <span>
            Since{" "}
            {new Date(createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <hr className="my-2" />

        {/* ACTIONS */}
        <div className="mt-auto d-flex gap-2">
          <button
            className="btn btn-outline-primary w-100"
            onClick={handleToggleStatus}
          >
            {isActive ? "Retire" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
