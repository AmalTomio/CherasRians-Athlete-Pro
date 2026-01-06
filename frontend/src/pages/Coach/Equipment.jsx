import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";
import DamageReportModal from "../../components/coach/DamageReportModal";
import { ToolsIcon, AlertIcon, CheckIcon } from "@primer/octicons-react";

export default function CoachEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDamageModal, setShowDamageModal] = useState(false);

  const fetchEquipment = async () => {
    const res = await api.get("/equipment");
    setEquipment(res.data.equipment || []);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const stats = {
    total: equipment.length,
    available: equipment.reduce((a, e) => a + e.quantityAvailable, 0),
    damaged: equipment.reduce((a, e) => a + e.quantityDamaged, 0),
  };

  return (
    <div className="container py-4">
      <h2 className="mb-1">Equipment</h2>
      <p className="text-muted mb-4">View and report damaged equipment</p>

      {/* STATS */}
      <div className="row g-4 mb-4">
        <StatCard
          title="Total Equipment"
          value={stats.total}
          icon={<ToolsIcon />}
        />
        <StatCard
          title="Available"
          value={stats.available}
          icon={<CheckIcon />}
        />
        <StatCard title="Damaged" value={stats.damaged} icon={<AlertIcon />} />
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-4">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Equipment</th>
              <th>Category</th>
              <th>Available</th>
              <th>Damaged</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((e) => (
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

                <td className="text-success">{e.quantityAvailable}</td>

                <td className="text-danger">{e.quantityDamaged || 0}</td>

                <td className="text-end">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      setSelected(e);
                      setShowDamageModal(true);
                    }}
                  >
                    Report Damage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
