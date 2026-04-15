import React, { useEffect, useState } from "react";
import { Badge, Button, Spinner } from "react-bootstrap";
import api from "../../api/axios";
import { confirmAlert, successAlert, errorAlert } from "../../utils/swal";

import { HomeIcon, CheckCircleIcon, ToolsIcon } from "@primer/octicons-react";
import { FiPlus, FiEdit3, FiTrash2, FiTool, FiCheckCircle, FiMapPin, FiFileText } from "react-icons/fi";

// Centralized Components
import AddFacilityModal from "../../components/AddFacilityModal";
import StatCard from "../../components/StatCard";
import HeroBanner from "../../components/HeroBanner";
import Table from "../../components/Table";

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [activeTab, setActiveTab] = useState("available");
  const [showModal, setShowModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  /* ================= FETCH ================= */
  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await api.get("/facilities");
      setFacilities(res.data.facilities || []);
    } catch (err) {
      errorAlert("Failed to fetch facilities.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */
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
    try {
      // Assuming your backend handles the status update on a specific route or via generic PUT
      await api.put(`/facilities/${id}`, { status: newStatus });
      successAlert(`Facility marked as ${newStatus}`);
      fetchFacilities();
    } catch (err) {
      errorAlert("Failed to update status");
      
      // Fallback: Optimistic UI update if API doesn't exist yet, keeping original logic
      setFacilities((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status: newStatus } : f))
      );
    }
  };

  /* ================= DATA PREP ================= */
  const filteredFacilities = facilities.filter((f) => f.status === activeTab);

  const stats = {
    total: facilities.length,
    available: facilities.filter((f) => f.status === "available").length,
    maintenance: facilities.filter((f) => f.status === "maintenance").length,
  };

  /* ================= TABLE CONFIG ================= */
  const columns = [
    {
      key: "details",
      label: "Facility Details",
      accessor: (row) => (
        <div className="d-flex align-items-center gap-3 py-2">
          <div className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
            <FiMapPin size={20} />
          </div>
          <div className="d-flex flex-column">
            <span className="fw-bolder text-dark" style={{ fontSize: "0.95rem" }}>{row.name || "Unnamed Facility"}</span>
            <span className="text-muted small fw-medium">Facility ID: {row._id?.slice(-5).toUpperCase() || "N/A"}</span>
          </div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      accessor: (row) => {
        const isAvailable = row.status === "available";
        return (
          <Badge 
            bg={isAvailable ? "success" : "danger"} 
            className={`px-3 py-2 rounded-pill shadow-sm border ${isAvailable ? 'border-success' : 'border-danger'} bg-opacity-75`}
          >
            {isAvailable ? "Available" : "Maintenance"}
          </Badge>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      accessor: (row) => {
        const isAvailable = row.status === "available";
        return (
          <div className="d-flex gap-2 align-items-center py-2">
            <Button
              variant="light"
              size="sm"
              className="border shadow-sm text-primary fw-bold d-flex align-items-center gap-2 rounded-pill px-3"
              onClick={() => {
                setSelectedFacility(row);
                setShowModal(true);
              }}
            >
              <FiEdit3 /> Edit
            </Button>
            
            <Button
              variant="light"
              size="sm"
              className={`border shadow-sm fw-bold d-flex align-items-center gap-2 rounded-pill px-3 ${isAvailable ? "text-warning" : "text-success"}`}
              onClick={() => handleStatusChanged(row._id, isAvailable ? "maintenance" : "available")}
            >
              {isAvailable ? <><FiTool /> Maint.</> : <><FiCheckCircle /> Avail.</>}
            </Button>

            <Button
              variant="light"
              size="sm"
              className="border shadow-sm text-danger fw-bold d-flex align-items-center gap-2 rounded-pill px-3"
              onClick={() => handleDelete(row._id)}
            >
              <FiTrash2 /> 
            </Button>
          </div>
        );
      }
    }
  ];

  /* ================= UI ================= */
  return (
    <div className="px-4 py-4">
      {/* ================= HERO BANNER ================= */}
      <HeroBanner 
        title="Facilities Management"
        subtitle="Manage and view all facilities in the system."
        buttonText="Add Facility"
        buttonIcon={FiPlus}
        onButtonClick={() => {
          setSelectedFacility(null);
          setShowModal(true);
        }}
      />

      {/* ================= STATS ================= */}
      <div className="row g-4 mb-5">
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

      {/* ================= PILL TABS HEADER ================= */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          {activeTab === "available" ? <CheckCircleIcon className="text-success"/> : <ToolsIcon className="text-danger"/>}
          {activeTab === "available" ? "Available Facilities" : "Under Maintenance"}
        </h5>

        {/* Custom Booking-style Tabs */}
        <div className="bg-light p-1 rounded-pill d-inline-flex border shadow-sm">
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
              activeTab === "available"
                ? "bg-white text-success shadow-sm"
                : "text-muted hover-dark"
            }`}
            onClick={() => setActiveTab("available")}
          >
            Available
          </button>
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
              activeTab === "maintenance"
                ? "bg-white text-danger shadow-sm"
                : "text-muted hover-dark"
            }`}
            onClick={() => setActiveTab("maintenance")}
          >
            Maintenance
          </button>
        </div>
      </div>

      {/* ================= DATA TABLE CONTAINER ================= */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden" style={{ minHeight: "300px" }}>
        {filteredFacilities.length === 0 && !loading ? (
           <div className="text-center py-5 text-muted">
             <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
               <FiFileText size={28} className="text-slate-400 opacity-50" />
             </div>
             <h6 className="fw-bold mb-1 text-dark">No Facilities Found</h6>
             <p className="mb-0 small">No facilities match the {activeTab} status.</p>
           </div>
        ) : (
           <Table 
             columns={columns} 
             data={filteredFacilities} 
             loading={loading} 
             itemsPerPage={10} 
           />
        )}
      </div>

      {/* ================= MODAL ================= */}
      <AddFacilityModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedFacility(null);
        }}
        onSaved={fetchFacilities}
        facility={selectedFacility}
      />

      {/* Hover styling for unselected tab */}
      <style>{`
        .hover-dark:hover {
          color: #1e293b !important;
        }
      `}</style>
    </div>
  );
}