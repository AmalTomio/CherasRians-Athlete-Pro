import { useState, useEffect } from "react";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";

const API_BASE_URL = api.defaults.baseURL.replace("/api", "");

export default function DamageReportDetailsModal({
  equipment,
  onClose,
  onResolved,
}) {
  if (!equipment) return null;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [equipment._id]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/equipment/${equipment._id}/damage-reports`
      );
      setReports(res.data.reports || []);
    } catch (err) {
      errorAlert("Failed to load damage reports");
    } finally {
      setLoading(false);
    }
  };

  const resolveReport = async (reportId) => {
    try {
      setResolvingId(reportId);
      await api.post(`/equipment/damage-reports/${reportId}/resolve`);
      successAlert("Damage marked as fixed. Inventory restored.");
      await fetchReports();
      onResolved?.();
    } catch (err) {
      errorAlert("Failed to resolve damage report");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" />

      {/* Modal */}
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="modal-header bg-danger text-white">
              <div>
                <h5 className="mb-0">
                  Damage Reports — {equipment.name}
                </h5>
                <small className="opacity-75">
                  Category: {equipment.category}
                </small>
              </div>
              <button
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>

            {/* Body */}
            <div className="modal-body p-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger" />
                </div>
              ) : reports.length === 0 ? (
                <div className="alert alert-success mb-0">
                  No active damage reports for this equipment.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Reported By</th>
                        <th>Quantity</th>
                        <th>Evidence</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r) => (
                        <tr key={r._id}>
                          <td>
                            {r.reportedBy?.firstName}{" "}
                            {r.reportedBy?.lastName}
                          </td>

                          <td className="fw-bold text-danger">
                            {r.quantityDamaged}
                          </td>

                          <td>
                            {r.images?.length > 0 ? (
                              <a
                                href={`${API_BASE_URL}${r.images[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={`${API_BASE_URL}${r.images[0]}`}
                                  alt="Damage"
                                  className="rounded border shadow-sm"
                                  style={{
                                    width: 72,
                                    height: 72,
                                    objectFit: "cover",
                                    cursor: "zoom-in",
                                  }}
                                />
                              </a>
                            ) : (
                              <span className="text-muted small">
                                No image
                              </span>
                            )}
                          </td>

                          <td>
                            {r.damageDescription || (
                              <span className="text-muted">—</span>
                            )}
                          </td>

                          <td>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                r.status === "resolved"
                                  ? "bg-success"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>

                          <td className="text-end">
                            {r.status !== "resolved" ? (
                              <button
                                className="btn btn-success btn-sm"
                                disabled={resolvingId === r._id}
                                onClick={() => resolveReport(r._id)}
                              >
                                {resolvingId === r._id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Processing
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-check-circle me-1" />
                                    Mark as Fixed
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-muted small">
                                Resolved
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer bg-light">
              <button
                className="btn btn-outline-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
