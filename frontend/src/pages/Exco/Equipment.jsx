import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";
import EquipmentModal from "../../components/EquipmentModal";
import StatCard from "../../components/StatCard";
import DamageReportDetailsModal from "../../components/exco/DamageReportDetailsModal";
import Table from "../../components/Table";
import HeroBanner from "../../components/HeroBanner";
import SkeletonTableLoader from "../../components/SkeletonTableLoader";
import {
  FiBox,
  FiCheckCircle,
  FiRefreshCw,
  FiAlertTriangle,
  FiPlus,
  FiSearch,
  FiCalendar,
  FiUser,
  FiEye,
  FiCheck,
} from "react-icons/fi";

export default function EquipmentManagement() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Damage Modal State
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDamageModal, setShowDamageModal] = useState(false);

  // Damage History State
  const [damageHistory, setDamageHistory] = useState([]);
  const [damageTab, setDamageTab] = useState("reported");

  // Filters
  const [search, setSearch] = useState("");

  const [pendingReturns, setPendingReturns] = useState([]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await api.get("/equipment");
      setEquipment(res.data.equipment || []);
    } catch (err) {
      errorAlert("Failed to load equipment inventory", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReturns = async () => {
    try {
      const res = await api.get("/equipment-borrow/pending");
      setPendingReturns(res.data.borrows || []);
    } catch (err) {
      console.error(err);
    }
  };

  const verifyReturn = async (borrowId) => {
    try {
      await api.post(`/equipment-borrow/verify/${borrowId}`, {
        approve: true,
      });

      successAlert("Return verified");
      fetchPendingReturns();
      fetchEquipment();
    } catch (err) {
      errorAlert("Failed to verify return", err);
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
    fetchPendingReturns();
  }, []);

  // ===== STATS CALCULATION =====
  const stats = useMemo(() => {
    const total = equipment.reduce((s, e) => s + e.quantityTotal, 0);
    const available = equipment.reduce((s, e) => s + e.quantityAvailable, 0);
    const damaged = equipment.reduce((s, e) => s + (e.quantityDamaged || 0), 0);
    const inUse = total - available - damaged;
    return { total, available, damaged, inUse };
  }, [equipment]);

  // ===== FILTER DATA =====
  const filteredEquipment = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredDamage = damageHistory.filter((r) => {
    if (damageTab === "reported") return r.status !== "resolved";
    if (damageTab === "resolved") return r.status === "resolved";
    return true;
  });

  // ===== INVENTORY COLUMNS =====
  const inventoryColumns = [
    {
      label: "No",
      key: "no",
      className: "px-4 fw-semibold text-secondary",
      accessor: (_, idx) => idx + 1,
    },
    {
      label: "Equipment Info",
      key: "name",
      accessor: (row) => (
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm"
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", // Indigo
            }}
          >
            <FiBox size={18} />
          </div>
          <div>
            <div className="fw-bold text-dark">{row.name}</div>
            <small
              className="text-muted text-uppercase"
              style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
            >
              {row.category || "General"}
            </small>
          </div>
        </div>
      ),
    },
    {
      label: "Total",
      key: "total",
      accessor: (row) => row.quantityTotal,
      className: "fw-bold text-dark",
    },
    {
      label: "Available",
      key: "available",
      accessor: (row) => (
        <span className="text-success fw-bold">{row.quantityAvailable}</span>
      ),
    },
    {
      label: "In Use",
      key: "inUse",
      accessor: (row) => {
        const inUse =
          row.quantityTotal -
          row.quantityAvailable -
          (row.quantityDamaged || 0);
        return <span className="text-primary fw-bold">{inUse}</span>;
      },
    },
    {
      label: "Damaged",
      key: "damaged",
      accessor: (row) =>
        row.quantityDamaged > 0 ? (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill">
            {row.quantityDamaged} Units
          </span>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      label: "Action",
      key: "action",
      className: "text-end px-4",
      accessor: (row) =>
        row.quantityDamaged > 0 && (
          <button
            className="btn btn-sm btn-outline-danger shadow-sm fw-bold d-inline-flex align-items-center gap-2"
            onClick={() => {
              setSelectedEquipment(row);
              setShowDamageModal(true);
            }}
            style={{ borderRadius: "8px" }}
          >
            <FiAlertTriangle /> View Reports
          </button>
        ),
    },
  ];

// ===== DAMAGE HISTORY COLUMNS =====
  const damageColumns = [
    {
      label: "No",
      key: "no",
      className: "px-4 fw-semibold text-secondary",
      accessor: (_, idx) => idx + 1,
    },
    {
      label: "Item Details",
      key: "item",
      accessor: (row) => (
        <div className="d-flex align-items-center gap-3 py-1">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm"
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", // Matches Inventory style
            }}
          >
            <FiBox size={18} />
          </div>
          <div className="d-flex flex-column">
            <span className="fw-bold text-dark">{row.equipmentId?.name || "Unknown Item"}</span>
            <span
              className="text-muted text-uppercase fw-medium"
              style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
            >
              {row.equipmentId?.category || "Reported Item"}
            </span>
          </div>
        </div>
      ),
    },
    {
      label: "Qty",
      key: "qty",
      accessor: (row) => (
        <span className="badge bg-danger text-white shadow-sm fw-bold px-3 py-2 rounded-pill">
          {row.quantityDamaged} Damaged
        </span>
      ),
    },
    {
      label: "Reported By",
      key: "reporter",
      accessor: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted small fw-medium">
          <FiUser className="text-secondary" /> {row.reportedBy?.firstName} {row.reportedBy?.lastName}
        </div>
      ),
    },
    {
      label: "Date",
      key: "date",
      accessor: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted small fw-medium">
          <FiCalendar className="text-secondary" /> {new Date(row.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      ),
    },
    {
      label: "Status",
      key: "status",
      className: "text-end px-4",
      accessor: (row) => {
        const isResolved = row.status === "resolved";
        return (
          <span
            className={`badge rounded-pill px-3 py-2 shadow-sm border ${
              isResolved
                ? "bg-success-subtle text-success border-success-subtle"
                : "bg-warning-subtle text-warning border-warning-subtle"
            }`}
          >
            {isResolved ? "Resolved" : "Pending Action"}
          </span>
        );
      },
    },
  ];

  // ===== PENDING RETURN COLUMNS =====
  const pendingReturnColumns = [
    {
      label: "No",
      key: "no",
      className: "px-4 fw-semibold text-secondary",
      accessor: (_, idx) => idx + 1,
    },
    {
      label: "Session",
      key: "session",
      accessor: (row) => (
        <span className="fw-bold text-dark">
          {row.bookingId?.sessionTitle || "General Session"}
        </span>
      ),
    },
    {
      label: "Borrower",
      key: "borrower",
      accessor: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted fw-medium small">
          <FiUser /> {row.borrowedBy?.firstName || "Unknown"}{" "}
          {row.borrowedBy?.lastName || ""}
        </div>
      ),
    },
    {
      label: "Due Date",
      key: "due",
      accessor: (row) => (
        <div className="d-flex align-items-center gap-2 text-secondary small">
          <FiCalendar size={14} />
          <span>
            {new Date(row.dueAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      ),
    },
    {
      label: "Status",
      key: "status",
      accessor: (row) => (
        <span
          className={`badge px-3 py-1 rounded-pill text-capitalize border ${
            row.status === "return_submitted"
              ? "bg-warning-subtle text-warning border-warning-subtle"
              : "bg-light text-secondary border-secondary-subtle"
          }`}
          style={{ fontSize: "0.75rem" }}
        >
          {row.status.replace("_", " ")}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      className: "text-end px-4",
      accessor: (row) =>
        row.status === "return_submitted" && (
          <div className="d-flex gap-2 justify-content-end">
            {row.returnProof && (
              <a
                href={`http://localhost:5000/uploads/returns/${row.returnProof}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-primary shadow-sm fw-bold d-inline-flex align-items-center gap-2"
                style={{ borderRadius: "8px" }}
              >
                <FiEye /> View Proof
              </a>
            )}
            <button
              className="btn btn-sm btn-success shadow-sm fw-bold d-inline-flex align-items-center gap-2"
              onClick={() => verifyReturn(row._id)}
              style={{ borderRadius: "8px" }}
            >
              <FiCheck /> Verify
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="px-4 py-4">
      <HeroBanner 
        title="Equipment Management"
        subtitle="Manage inventory, track availability, and handle damage reports."
        buttonText="Add Equipment"
        buttonIcon={FiPlus}
        onButtonClick={() => setShowAdd(true)}
      />

      <div className="row g-4 mb-5">
        <StatCard
          title="Total Items"
          value={stats.total}
          icon={<FiBox size={24} />}
          iconBg="#eef2ff"
          iconColor="#4f46e5"
        />
        <StatCard
          title="Available"
          value={stats.available}
          icon={<FiCheckCircle size={24} />}
          iconBg="#ecfdf5"
          iconColor="#10b981"
        />
        <StatCard
          title="In Use"
          value={stats.inUse}
          icon={<FiRefreshCw size={24} />}
          iconBg="#eff6ff"
          iconColor="#3b82f6"
        />
        <StatCard
          title="Damaged"
          value={stats.damaged}
          icon={<FiAlertTriangle size={24} />}
          iconBg="#fef2f2"
          iconColor="#ef4444"
        />
      </div>

      {/* ===== INVENTORY SECTION ===== */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark m-0">Inventory List</h5>
          <div className="input-group w-auto">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <FiSearch />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: "200px" }}
            />
          </div>
        </div>

        <div
          className="card border-0 shadow-sm rounded-4 overflow-hidden"
          style={{ minHeight: "300px" }}
        >
          <div className="table-responsive">
            <Table
              columns={inventoryColumns}
              data={filteredEquipment}
              loading={loading}
              customSkeleton={<SkeletonTableLoader rows={5} />}
            />
          </div>
        </div>
      </div>

      {/* ===== DAMAGE HISTORY SECTION ===== */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            Damage History
          </h5>

          {/* TABS */}
          <div className="bg-light p-1 rounded-pill d-inline-flex border">
            <button
              className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
                damageTab === "reported"
                  ? "bg-white text-danger shadow-sm"
                  : "text-muted hover-dark"
              }`}
              onClick={() => setDamageTab("reported")}
            >
              Reported
            </button>
            <button
              className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
                damageTab === "resolved"
                  ? "bg-white text-success shadow-sm"
                  : "text-muted hover-dark"
              }`}
              onClick={() => setDamageTab("resolved")}
            >
              Resolved
            </button>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <Table
              columns={damageColumns}
              data={filteredDamage}
              loading={false} // Assuming fetched on mount
              customSkeleton={<SkeletonTableLoader rows={3} />}
            />
          </div>
          {filteredDamage.length === 0 && (
            <div className="text-center py-5 text-muted">
              <FiCheckCircle
                size={40}
                className="mb-2 opacity-25 text-success"
              />
              <p className="m-0">No {damageTab} issues found.</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== PENDING RETURNS SECTION ===== */}
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            Pending Equipment Returns
          </h5>
          {pendingReturns.length > 0 && (
            <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill">
              {pendingReturns.length} Pending
            </span>
          )}
        </div>

        <div
          className="card border-0 shadow-sm rounded-4 overflow-hidden"
          style={{ minHeight: "200px" }}
        >
          {pendingReturns.length === 0 ? (
            <div className="text-center py-5 text-muted bg-white h-100 d-flex flex-column justify-content-center align-items-center">
              <FiCheckCircle
                size={48}
                className="mb-3 text-success opacity-50"
              />
              <h5 className="fw-bold text-dark">All clear!</h5>
              <p className="m-0 text-secondary">
                No pending equipment returns to verify at the moment.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table
                columns={pendingReturnColumns}
                data={pendingReturns}
                loading={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
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
            fetchDamageHistory(); // Refresh history
          }}
        />
      )}
    </div>
  );
}
