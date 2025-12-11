export default function FacilityCard({ facility, onBook }) {
  const { name, status } = facility;

  const statusColor = {
    available: "success",
    booked: "warning",
    maintenance: "danger",
  }[status] || "secondary";

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title">{name}</h5>

        <span className={`badge bg-${statusColor} mb-2`}>
          {status.toUpperCase()}
        </span>

        <button
          className="btn btn-primary w-100"
          disabled={status !== "available"}
          onClick={() => onBook(facility)}
        >
          {status === "available" ? "Book Now" : "Not Available"}
        </button>
      </div>
    </div>
  );
}
