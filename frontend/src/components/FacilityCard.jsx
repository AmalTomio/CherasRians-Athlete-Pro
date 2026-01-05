import { HomeIcon } from "@primer/octicons-react";
import api from "../api/axios";
import { confirmAlert, successAlert, errorAlert } from "../utils/swal";

export default function FacilityCard({
  facility,
  onBook,
  onDelete,
  onEdit,
  excoView = false,
  onStatusChanged,
}) {
  const {
    _id,
    name,
    status,
    type,
    capacity,
    location,
    amenities = [],
  } = facility;

  const statusMap = {
    available: {
      label: "Available",
      bg: "bg-success-subtle",
      text: "text-success",
    },
    maintenance: {
      label: "Maintenance",
      bg: "bg-danger-subtle",
      text: "text-danger",
    },
    booked: {
      label: "Booked",
      bg: "bg-warning-subtle",
      text: "text-warning",
    },
  };

  const statusUI = statusMap[status] || statusMap.available;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return;

    const result = await confirmAlert.fire({
      title: "Change Facility Status?",
      text: `Change status to "${newStatus}"`,
      icon: "warning",
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/facilities/${_id}/status`, { status: newStatus });
      successAlert("Facility status updated");
      onStatusChanged?.(newStatus, true);
    } catch (err) {
      errorAlert("Failed to update status");
    }
  };

  return (
    <div className="card border-0 shadow-sm h-100 rounded-4">
      <div className="card-body d-flex flex-column gap-2">
        {/* ===== HEADER ===== */}
        <div className="d-flex justify-content-between align-items-start">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: 44, height: 44, background: "#eef2ff" }}
          >
            <HomeIcon size={22} className="text-primary" />
          </div>

          <span
            className={`badge rounded-pill px-3 py-2 ${statusUI.bg} ${statusUI.text}`}
          >
            {statusUI.label}
          </span>
        </div>

        {/* ===== NAME ===== */}
        <h5 className="mt-2 mb-1">{name}</h5>

        {/* ===== DETAILS ===== */}
        <div className="text-muted small">
          {type && <div>Type: {type}</div>}
          {capacity && <div>Capacity: {capacity} people</div>}
          {location && <div>Location: {location}</div>}
        </div>

        {/* ===== AMENITIES ===== */}
        {amenities.length > 0 && (
          <div className="mt-2">
            <div className="fw-semibold mb-1 small">Amenities</div>
            <div className="d-flex flex-wrap gap-2">
              {amenities.map((a, idx) => (
                <span
                  key={idx}
                  className="badge bg-light text-dark fw-normal px-2 py-1"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ===== ACTIONS ===== */}
        <div className="mt-auto">
          {/* COACH BOOK */}
          {onBook && (
            <button
              className="btn btn-primary w-100"
              disabled={status !== "available"}
              onClick={() => onBook(facility)}
            >
              {status === "available" ? "Book Facility" : "Not Available"}
            </button>
          )}

          {/* EXCO CONTROLS */}
          {excoView && (
            <>
              <select
                className="form-select mt-2"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="booked">Booked</option>
              </select>

              <div className="d-flex gap-2 mt-2">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={onEdit}
                >
                  Edit
                </button>
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={onDelete}
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
