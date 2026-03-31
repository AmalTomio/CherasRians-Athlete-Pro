import React from "react";
import moment from "moment-timezone";

const STATUS_COLOR = {
  win: "success",
  loss: "danger",
  draw: "secondary",
};

export default function MatchTable({ matches, role, onAddResult, onAddStats }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="alert alert-light text-center">
        No matches found.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle bg-white shadow-sm rounded-3">
        <thead className="table-light">
          <tr>
            <th>Opponent</th>
            <th>Date & Time</th>
            <th>Venue</th>
            <th>Sport & Category</th>
            <th>Result</th>
            <th>Status</th>
            {(role === "coach") && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => {
            const resultLabel = m.ourScore !== undefined && m.opponentScore !== undefined
              ? `${m.ourScore} - ${m.opponentScore}`
              : "Pending";
            
            const badgeColor = STATUS_COLOR[m.result] || "warning";

            return (
              <tr key={m._id}>
                <td className="fw-medium">{m.opponent}</td>
                <td>{moment(m.matchDate).format("DD MMM YYYY, hh:mm A")}</td>
                <td>{m.venue}</td>
                <td>
                  <span className="text-muted d-block">{m.sport}</span>
                  <span className="badge bg-light text-dark border">{m.category}</span>
                </td>
                <td className="fw-bold">{resultLabel}</td>
                <td>
                  <span className={`badge bg-${badgeColor}`}>
                    {m.result ? m.result.toUpperCase() : "PENDING"}
                  </span>
                </td>
                {(role === "coach") && (
                  <td>
                    <div className="d-flex gap-2">
                       <button
                         className="btn btn-sm btn-outline-primary"
                         onClick={() => onAddResult(m)}
                       >
                         Result
                       </button>
                       <button
                         className="btn btn-sm btn-outline-success"
                         onClick={() => onAddStats(m)}
                       >
                         Stats
                       </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
