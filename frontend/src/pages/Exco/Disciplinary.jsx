import React, { useState, useEffect, useMemo } from "react";
import { Form, Button, Badge, Spinner } from "react-bootstrap";
import moment from "moment-timezone";
import api from "../../api/axios";
import { getSocket } from "../../socket";
import { errorAlert } from "../../utils/swal";
import { 
  FiUser, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiFileText, 
  FiDownload 
} from "react-icons/fi";

import FiltersCard from "../../components/FiltersCard";
import StatCard from "../../components/StatCard";
import Table from "../../components/Table";
import HeroBanner from "../../components/HeroBanner";

export default function ExcoDisciplinary() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("");
  const [category, setCategory] = useState("");

  const fetchRecords = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/disciplinary/all");
      const data = res.data.data || [];
      setRecords(data);
      setFiltered(data);
    } catch {
      if (!silent) setError("Failed to fetch disciplinary records.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => fetchRecords(true);
    socket.on("dashboard_update", handler);
    return () => socket.off("dashboard_update", handler);
  }, []);

  useEffect(() => {
    let data = [...records];

    if (search) {
      data = data.filter((r) =>
        `${r.playerId?.firstName} ${r.playerId?.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (sport) {
      data = data.filter((r) => r.sport === sport);
    }

    if (category) {
      data = data.filter((r) => r.category === category);
    }

    setFiltered(data);
  }, [search, sport, category, records]);

  const handleExport = async () => {
    try {
      const res = await api.get("/reports/disciplinary", {
        params: {
          playerName: search,
          sport: sport,
          category: category,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;

      const filename = `disciplinary_${new Date()
        .toISOString()
        .split("T")[0]}.xlsx`;

      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      errorAlert("Failed to export disciplinary report");
    }
  };


  const activeCases = filtered.filter(c => c.status === "open").length;
  const resolvedCases = filtered.filter(c => c.status === "resolved").length;
  const highSeverity = filtered.filter(c => c.status === "open" && c.severity === "high").length;

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high": return <Badge bg="danger" className="px-3 py-2 rounded-pill shadow-sm">High</Badge>;
      case "medium": return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill shadow-sm">Medium</Badge>;
      case "low": return <Badge bg="info" className="px-3 py-2 rounded-pill shadow-sm">Low</Badge>;
      default: return <Badge bg="secondary" className="px-3 py-2 rounded-pill">{severity}</Badge>;
    }
  };

  const columns = [
    {
      key: "athlete",
      label: "Athlete",
      accessor: (row) => {
        const fName = row.playerId?.firstName || "";
        const lName = row.playerId?.lastName || "";
        const initials = `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase() || "?";

        return (
          <div className="d-flex align-items-center gap-3 py-2">
            <div 
              className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bolder" 
              style={{ width: '42px', height: '42px', fontSize: '0.95rem', letterSpacing: '0.5px' }}
            >
              {initials}
            </div>
            <div>
              <span className="fw-bolder text-dark d-block" style={{ fontSize: '0.95rem' }}>
                {fName} {lName}
              </span>
              
            </div>
          </div>
        );
      }
    },
    {
      key: "sport",
      label: "Sport & Team",
      accessor: (row) => (
        <div className="d-flex flex-column py-2">
          <span className="fw-bold text-dark mb-1 text-capitalize">{row.sport?.replace('_', ' ')}</span>
          <span className="text-muted small fw-medium">{row.category} Squad</span>
        </div>
      )
    },
    {
      key: "details",
      label: "Incident Details",
      accessor: (row) => (
        <div className="d-flex flex-column py-2">
          <span className="fw-bold text-dark mb-1">{row.type || "General Conduct"}</span>
          <span className="text-muted small text-truncate" style={{ maxWidth: '250px' }} title={row.reason}>
            {row.reason}
          </span>
        </div>
      )
    },
    {
      key: "severity",
      label: "Severity",
      accessor: (row) => getSeverityBadge(row.severity)
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => (
        <span className="fw-medium text-secondary">
          {moment(row.createdAt).format("DD MMM YYYY")}
        </span>
      )
    }
  ];

  return (
    <div className="px-4 py-4">
      
      <HeroBanner 
        title="Disciplinary Oversight"
        subtitle="Monitor and audit player conduct across all sports and categories."
        buttonText="Export Report"
        buttonIcon={FiDownload}
        onButtonClick={handleExport}
      />

      <div className="row g-4 mb-4">
        <StatCard title="Active Cases" value={activeCases} icon={<FiClock size={22}/>} iconBg="#eff6ff" iconColor="#3b82f6" />
        <StatCard title="Resolved Cases" value={resolvedCases} icon={<FiCheckCircle size={22}/>} iconBg="#ecfdf5" iconColor="#10b981" />
        <StatCard title="Critical Actions" value={highSeverity} icon={<FiAlertCircle size={22}/>} iconBg="#fef2f2" iconColor="#ef4444" />
      </div>

      <div className="mb-4">
        <FiltersCard
          search={search}
          setSearch={setSearch}
          searchPlaceholder="Search athlete name..."
          
          showSport={true}
          sport={sport}
          setSport={setSport}
          
          showCategory={true}
          category={category}
          setCategory={setCategory}
          
          showYear={false}
          showClass={false} 
          showStatus={false}
          
          onReset={() => {
            setSearch("");
            setSport("");
            setCategory("");
          }}
        />
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        {filtered.length === 0 && !loading ? (
           <div className="text-center py-5 text-muted">
             <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
               <FiFileText size={28} className="text-slate-400 opacity-50" />
             </div>
             <h6 className="fw-bold mb-1 text-dark">No Records Found</h6>
             <p className="mb-0 small">No disciplinary logs match your current filters.</p>
           </div>
        ) : (
           <Table 
             columns={columns} 
             data={filtered} 
             loading={loading} 
             itemsPerPage={10} 
           />
        )}
      </div>

      <style>{`
        /* Overriding native Table component padding to match enterprise card feel */
        .table > :not(caption) > * > * {
           padding: 1rem 1.5rem;
        }
        .table > thead > tr > th {
           background-color: transparent !important;
           border-bottom: 2px solid #f1f5f9 !important;
           font-size: 0.75rem;
           color: #64748b !important;
           text-transform: uppercase;
           letter-spacing: 0.05em;
        }
        .table > tbody > tr > td {
           border-bottom: 1px solid #f8fafc;
           vertical-align: middle;
        }
        .table > tbody > tr:hover > td {
           background-color: #f8fafc !important;
        }
        
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.15) !important; cursor: pointer; }
      `}</style>
    </div>
  );
}