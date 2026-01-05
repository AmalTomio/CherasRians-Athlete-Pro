import { useEffect, useState } from "react";
import api from "../../api/axios";
import { confirmAlert, successAlert, errorAlert } from "../../utils/swal";

import { HomeIcon, CheckCircleIcon, ToolsIcon } from "@primer/octicons-react";

import FacilityCard from "../../components/FacilityCard";
import AddFacilityModal from "../../components/AddFacilityModal";
import StatCard from "../../components/StatCard";

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [showModal, setShowModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    const res = await api.get("/facilities");
    setFacilities(res.data.facilities);
  };

  const handleDelete = async (id) => {
    const result = await confirmAlert.fire({
      title: "Remove Facility?",
      text: "This action cannot be undone.",
      icon: "warning",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/facilities/${id}`);
      successAlert("Facility removed successfully");
      fetchFacilities();
    } catch (err) {
      errorAlert("Failed to remove facility");
    }
  };

  const handleStatusChanged = async (id, newStatus) => {
    setFacilities((prev) =>
      prev.map((f) => (f._id === id ? { ...f, status: newStatus } : f))
    );

    await fetchFacilities();
  };

  const filtered = facilities.filter((f) => f.status === activeTab);

  const stats = {
    total: facilities.length,
    available: facilities.filter((f) => f.status === "available").length,
    maintenance: facilities.filter((f) => f.status === "maintenance").length,
  };

  return (
    <div className="container py-4">
      {/* ===== STATS ===== */}
      <div className="row g-4 mb-4">
        <StatCard
          title="Total Facilities"
          value={stats.total}
          icon={<HomeIcon size={22} />}
          iconBg="#eef2ff"
          iconColor="#2563eb"
        />

        <StatCard
          title="Available Facilities"
          value={stats.available}
          icon={<CheckCircleIcon size={22} />}
          iconBg="#ecfdf5"
          iconColor="#16a34a"
        />

        <StatCard
          title="Maintenance"
          value={stats.maintenance}
          icon={<ToolsIcon size={22} />}
          iconBg="#fef2f2"
          iconColor="#dc2626"
        />
      </div>

      {/* ===== HEADER ===== */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <ul className="nav nav-tabs">
          {["available", "maintenance"].map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Facility
        </button>
      </div>

      {/* ===== FACILITY LIST ===== */}
      <div className="row g-4">
        {filtered.map((facility) => (
          <div className="col-md-4" key={facility._id}>
            <FacilityCard
              facility={facility}
              excoView
              onDelete={() => handleDelete(facility._id)}
              onEdit={() => {
                setSelectedFacility(facility);
                setShowModal(true);
              }}
              onStatusChanged={(newStatus) =>
                handleStatusChanged(facility._id, newStatus)
              }
            />
          </div>
        ))}
      </div>

      {/* ===== MODAL ===== */}
      <AddFacilityModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedFacility(null);
        }}
        onSaved={fetchFacilities}
        facility={selectedFacility}
      />
    </div>
  );
}
