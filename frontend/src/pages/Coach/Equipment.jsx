import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";
import DamageReportModal from "../../components/coach/DamageReportModal";
import Table from "../../components/Table";
import SkeletonTableLoader from "../../components/SkeletonTableLoader";
import { 
  FiTool, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiBox 
} from "react-icons/fi";

export default function CoachEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showDamageModal, setShowDamageModal] = useState(false);

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

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Optimized Stats Calculation
  const stats = useMemo(() => ({
    total: equipment.reduce((a, e) => a + e.quantityTotal, 0), // Sum of total items, or just equipment.length depending on need. Using total quantity here.
    available: equipment.reduce((a, e) => a + e.quantityAvailable, 0),
    damaged: equipment.reduce((a, e) => a + (e.quantityDamaged || 0), 0),
  }), [equipment]);

  // Table Columns Configuration
  const columns = useMemo(() => [
    {
      label: "No",
      key: "no",
      className: "px-4 fw-semibold text-secondary",
      accessor: (_, index) => index + 1
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
              background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)" // Indigo Theme
            }}
          >
            <FiBox size={18} />
          </div>
          <div>
            <div className="fw-bold text-dark">{row.name}</div>
            <small className="text-muted text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>
              {row.category || "General"}
            </small>
          </div>
        </div>
      )
    },
    {
      label: "Available",
      key: "available",
      accessor: (row) => <span className="text-success fw-bold">{row.quantityAvailable}</span>
    },
    {
      label: "Damaged",
      key: "damaged",
      accessor: (row) => (
        row.quantityDamaged > 0 ? (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill">
            {row.quantityDamaged}
          </span>
        ) : (
          <span className="text-muted">-</span>
        )
      )
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
      )
    }
  ], []);

  return (
    <div className="px-4 py-4">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1 text-dark" style={{ letterSpacing: "-0.5px" }}>
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

      {/* DATA TABLE */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ minHeight: "300px" }}>
        <div className="table-responsive">
          <Table 
            columns={columns} 
            data={equipment} 
            loading={loading}
            customSkeleton={<SkeletonTableLoader rows={6} />}
          />
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