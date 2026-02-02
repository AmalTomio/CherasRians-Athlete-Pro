import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Modal } from "react-bootstrap";
import SkeletonTableLoader from "../../components/SkeletonTableLoader";

import { FiUser, FiUsers } from "react-icons/fi";

export default function CoachPlayersModal({ coach, show, onClose }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show && coach?.sport) {
      fetchPlayers(coach.sport);
    } else {
      setPlayers([]);
    }
  }, [show, coach]);

  const fetchPlayers = async (sport) => {
    try {
      setLoading(true);
      const res = await api.get("/exco/students", {
        params: { sport, limit: 100 },
      });
      setPlayers(res.data.students || []);
    } catch (err) {
      console.error("Failed to load players", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (f, l) =>
    `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      style={{
        display: show ? "block" : "none",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
          {/* HEADER */}
          <div className="modal-header border-bottom-0 p-4 bg-light d-flex align-items-center">
            <div>
              <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                <FiUsers className="text-primary" />
                {coach?.firstName}'s Players
              </h5>
              <p className="m-0 text-muted small">
                Listing all students assigned to{" "}
                <span className="fw-bold text-primary text-uppercase">
                  {coach?.sport || "General"}
                </span>
              </p>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* BODY */}
          <div className="modal-body p-0">
            <div
              className="table-responsive"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <table className="table table-hover align-middle mb-0">
                <thead
                  className="bg-white sticky-top text-secondary small fw-bold text-uppercase"
                  style={{ top: 0, zIndex: 10 }}
                >
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3">Student Name</th>
                    <th className="py-3">Form</th>
                    <th className="py-3">Class</th>
                    <th className="py-3 text-end px-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <SkeletonTableLoader rows={5} />
                  ) : players.length > 0 ? (
                    players.map((p, idx) => (
                      <tr key={p.userId || idx}>
                        <td className="px-4 fw-semibold text-secondary">
                          {idx + 1}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                              style={{
                                width: "32px",
                                height: "32px",
                                background:
                                  "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                                fontSize: "12px",
                              }}
                            >
                              {getInitials(p.firstName, p.lastName)}
                            </div>
                            <span className="fw-bold text-dark">
                              {p.firstName} {p.lastName}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            Form {p.year}
                          </span>
                        </td>
                        <td className="text-muted fw-medium">{p.classGroup}</td>
                        <td className="text-end px-4">
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <div className="d-flex flex-column align-items-center text-muted opacity-50">
                          <FiUser size={40} className="mb-2" />
                          <h6>No players assigned yet</h6>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-top-0 bg-light p-3">
            <button
              className="btn btn-light border fw-semibold"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
