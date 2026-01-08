import { useEffect, useState } from "react";
import api from "../../api/axios";

import { successAlert, errorAlert } from "../../utils/swal";
import {
  PackageIcon,
  CheckCircleIcon,
  SyncIcon,
  AlertIcon,
} from "@primer/octicons-react";

import EquipmentModal from "../../components/EquipmentModal";
import StatCard from "../../components/StatCard";
import DamageReportDetailsModal from "../../components/exco/DamageReportDetailsModal";

export default function EquipmentManagement() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [damageHistory, setDamageHistory] = useState([]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await api.get("/equipment");
      setEquipment(res.data.equipment || []);
    } catch (err) {
      errorAlert("Failed to load equipment inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchDamageHistory = async () => {
    try {
      const res = await api.get("/equipment/damage-reports");
      setDamageHistory(res.data.reports || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEquipment();
    fetchDamageHistory();
  }, []);

  // ===== STATS =====
  const totalItems = equipment.reduce((s, e) => s + e.quantityTotal, 0);
  const available = equipment.reduce((s, e) => s + e.quantityAvailable, 0);
  const damaged = equipment.reduce((s, e) => s + (e.quantityDamaged || 0), 0);
  const inUse = totalItems - available - damaged;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Equipment Management</h2>
          <p className="text-muted">
            Manage equipment inventory and approve requests
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Add New Equipment
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className="nav-link active">Inventory</button>
        </li>
        {/* <li className="nav-item">
          <button className="nav-link">Requests</button>
        </li> */}
      </ul>

      {/* Stats */}
      <div className="row g-4 mb-4">
        <StatCard
          title="Total Equipment"
          value={totalItems}
          icon={<PackageIcon size={22} />}
          iconBg="#eef2ff"
          iconColor="#2563eb"
        />

        <StatCard
          title="Available"
          value={available}
          icon={<CheckCircleIcon size={22} />}
          iconBg="#ecfdf5"
          iconColor="#16a34a"
        />

        <StatCard
          title="In Use"
          value={inUse}
          icon={<SyncIcon size={22} />}
          iconBg="#eff6ff"
          iconColor="#2563eb"
        />

        <StatCard
          title="Damaged"
          value={damaged}
          icon={<AlertIcon size={22} />}
          iconBg="#fef2f2"
          iconColor="#dc2626"
        />
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>In Use</th>
                  <th>Damaged</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((e) => {
                  const inUse =
                    e.quantityTotal -
                    e.quantityAvailable -
                    (e.quantityDamaged || 0);

                  return (
                    <tr key={e._id} className="equipment-row">
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="equipment-icon">
                            <i className="bi bi-box-seam"></i>
                          </div>
                          <span className="fw-semibold">{e.name}</span>
                        </div>
                      </td>

                      <td className="text-muted">{e.category || "—"}</td>
                      <td>{e.quantityTotal}</td>
                      <td className="text-success">{e.quantityAvailable}</td>
                      <td className="text-primary">{inUse}</td>
                      <td className="text-danger">{e.quantityDamaged || 0}</td>

                      <td className="text-end">
                        {e.quantityDamaged > 0 && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              setSelectedEquipment(e);
                              setShowDamageModal(true);
                            }}
                          >
                            View Damage
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="d-flex align-items-center my-5">
        <div className="flex-grow-1 border-top"></div>
        <div className="px-3">
          <h4 className="mb-0 text-muted">Damage History</h4>
        </div>
        <div className="flex-grow-1 border-top"></div>
      </div>
      {/* ================= DAMAGE HISTORY ================= */}
      {damageHistory.length > 0 && (
        <div className="card shadow-sm mt-5">
          <div className="card-body">
            <h5 className="fw-semibold mb-4">Damage History</h5>

            <div className="list-group list-group-flush">
              {damageHistory.map((r) => (
                <div
                  key={r._id}
                  className="list-group-item py-3 d-flex align-items-center justify-content-between"
                >
                  {/* LEFT */}
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: 44,
                        height: 44,
                        background: "#fee2e2",
                        color: "#dc2626",
                        fontWeight: 600,
                      }}
                    >
                      <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>

                    <div>
                      <div className="fw-semibold">{r.equipmentId?.name}</div>
                      <div className="small text-muted">
                        {r.quantityDamaged} damaged · Reported by{" "}
                        {r.reportedBy?.firstName} {r.reportedBy?.lastName}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-end">
                    <div className="small text-muted">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                    <span
                      className={`badge ${
                        r.status === "resolved"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAdd && (
        <EquipmentModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            fetchEquipment();
            successAlert("Equipment added successfully");
          }}
        />
      )}

      {showDamageModal && selectedEquipment && (
        <DamageReportDetailsModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowDamageModal(false);
            setSelectedEquipment(null);
          }}
          onResolved={() => {
            setShowDamageModal(false);
            setSelectedEquipment(null);
            fetchEquipment();
          }}
        />
      )}
    </div>
  );
}
