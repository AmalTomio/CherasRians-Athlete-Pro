import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";
import DamageReportModal from "../../components/coach/DamageReportModal";
import Table from "../../components/Table";
import SkeletonTableLoader from "../../components/SkeletonTableLoader";
import { 
  FiTool, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiBox,
  FiCalendar,
  FiUpload
} from "react-icons/fi";

export default function CoachEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [returnsRequired, setReturnsRequired] = useState([]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await api.get("/equipment");
      setEquipment(res.data.equipment || []);
    } catch (err) {
      console.error("Failed to load equipment", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnsRequired = useCallback(async () => {
    try {
      const res = await api.get("/equipment-borrow/my-returns");
      setReturnsRequired(res.data.borrows || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const submitReturn = useCallback(async (borrowId) => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("proof", file);

        await api.post(`/equipment-borrow/return/${borrowId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        fetchReturnsRequired(); // refresh list
      };

      input.click();
    } catch (err) {
      console.error(err);
    }
  }, [fetchReturnsRequired]);

  useEffect(() => {
    fetchEquipment();
    fetchReturnsRequired();
  }, [fetchReturnsRequired]);

  const stats = useMemo(
    () => ({
      total: equipment.reduce((a, e) => a + e.quantityTotal, 0),
      available: equipment.reduce((a, e) => a + e.quantityAvailable, 0),
      damaged: equipment.reduce((a, e) => a + (e.quantityDamaged || 0), 0),
    }),
    [equipment]
  );

  // Table Columns Configuration - Equipment Inventory
  const columns = useMemo(
    () => [
      {
        label: "No",
        key: "no",
        className: "px-4 fw-semibold text-secondary",
        accessor: (_, index) => index + 1,
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
                background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", // Indigo Theme
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
        label: "Available",
        key: "available",
        accessor: (row) => (
          <span className="text-success fw-bold">{row.quantityAvailable}</span>
        ),
      },
      {
        label: "Damaged",
        key: "damaged",
        accessor: (row) =>
          row.quantityDamaged > 0 ? (
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill">
              {row.quantityDamaged}
            </span>
          ) : (
            <span className="text-muted">-</span>
          ),
      },
      {
        label: "Action",
        key: "action",
        className: "text-end px-4",
        accessor: (row) => (
          <button
            className="btn btn-sm btn-outline-danger shadow-sm fw-bold d-inline-flex align-items-center gap-2"
            onClick={() => {
              setSelected(row);
              setShowDamageModal(true);
            }}
            style={{ borderRadius: "8px" }}
          >
            <FiAlertTriangle /> Report Damage
          </button>
        ),
      },
    ],
    []
  );

  // Table Columns Configuration - Return Required
  const returnColumns = useMemo(
    () => [
      {
        label: "No",
        key: "no",
        className: "px-4 fw-semibold text-secondary",
        accessor: (_, index) => index + 1,
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
        label: "Due Date",
        key: "due",
        accessor: (row) => (
          <div className="d-flex align-items-center gap-2 text-secondary">
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
        accessor: (row) => {
          const isOverdue = row.status === "overdue" || new Date(row.dueAt) < new Date();
          return (
            <span
              className={`badge px-3 py-1 rounded-pill text-capitalize border ${
                isOverdue
                  ? "bg-danger-subtle text-danger border-danger-subtle"
                  : "bg-warning-subtle text-warning border-warning-subtle"
              }`}
              style={{ fontSize: "0.75rem" }}
            >
              {isOverdue ? "Overdue" : row.status}
            </span>
          );
        },
      },
      {
        label: "Action",
        key: "action",
        className: "text-end px-4",
        accessor: (row) => (
          <button
            className="btn btn-sm btn-outline-primary shadow-sm fw-bold d-inline-flex align-items-center gap-2"
            onClick={() => submitReturn(row._id)}
            style={{ borderRadius: "8px" }}
          >
            <FiUpload /> Upload Proof
          </button>
        ),
      },
    ],
    [submitReturn]
  );

  return (
    <div className="px-4 py-4">
      {/* HEADER */}
      <div className="mb-4">
        <h2
          className="fw-bold mb-1 text-dark"
          style={{ letterSpacing: "-0.5px" }}
        >
          Equipment
        </h2>
        <p className="text-muted">View inventory and report damaged items.</p>
      </div>

      {/* STATS CARDS */}
      <div className="row g-4 mb-5">
        <StatCard
          title="Total Items"
          value={stats.total}
          icon={<FiTool size={24} />}
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
          title="Damaged"
          value={stats.damaged}
          icon={<FiAlertTriangle size={24} />}
          iconBg="#fef2f2"
          iconColor="#ef4444"
        />
      </div>

      {/* DATA TABLE: EQUIPMENT */}
      <div
        className="card border-0 shadow-sm rounded-4 overflow-hidden"
        style={{ minHeight: "300px" }}
      >
        <div className="table-responsive">
          <Table
            columns={columns}
            data={equipment}
            loading={loading}
            customSkeleton={<SkeletonTableLoader rows={6} />}
          />
        </div>
      </div>

      {/* DATA TABLE: RETURNS REQUIRED */}
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            Returns Required
          </h4>
          {returnsRequired.length > 0 && (
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill">
              {returnsRequired.length} Pending
            </span>
          )}
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ minHeight: "200px" }}>
          {returnsRequired.length === 0 ? (
            <div className="text-center py-5 text-muted bg-white h-100 d-flex flex-column justify-content-center align-items-center">
              <FiCheckCircle size={48} className="mb-3 text-success opacity-50" />
              <h5 className="fw-bold text-dark">All caught up!</h5>
              <p className="m-0 text-secondary">No equipment returns are currently required.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table
                columns={returnColumns}
                data={returnsRequired}
                loading={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* DAMAGE MODAL */}
      <DamageReportModal
        show={showDamageModal}
        equipmentList={equipment.filter((eq) => eq.quantityAvailable > 0)}
        onClose={() => {
          setShowDamageModal(false);
          setSelected(null);
        }}
        onReported={() => {
          fetchEquipment();
          setShowDamageModal(false);
          setSelected(null);
        }}
      />
    </div>
  );
}