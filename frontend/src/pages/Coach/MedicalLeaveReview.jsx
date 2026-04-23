import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { Card, Modal, Button, Badge } from "react-bootstrap";
import moment from "moment";
import { successAlert, errorAlert, confirmAlert } from "../../utils/swal";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFileText,
  FiCalendar,
  FiUser
} from "react-icons/fi";

import HeroBanner from "../../components/HeroBanner";
import StatCard from "../../components/StatCard";
import FiltersCard from "../../components/FiltersCard";
import Table from "../../components/Table";

const MedicalLeaveReview = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);


  const [fileType, setFileType] = useState("");
const [zoom, setZoom] = useState(1);
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get("/medical/coach");
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error(err);
      errorAlert("Failed to load medical leave applications");
    } finally {
      setLoading(false);
    }
  };

  /* ================= NAME HELPER ================= */
  const getDisplayName = (row) => {
    if (row.userId?.firstName) {
      return `${row.userId.firstName} ${row.userId.lastName || ""}`;
    }
    if (row.studentName) {
      return row.studentName;
    }
    return "Unknown";
  };

  /* ================= FILTER ================= */
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      if (activeTab !== "All" && l.status !== activeTab) return false;

      if (search) {
        const name = getDisplayName(l).toLowerCase();
        if (!name.includes(search.toLowerCase())) return false;
      }

      return true;
    });
  }, [leaves, activeTab, search]);

  /* ================= STATS ================= */
  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  /* ================= REVIEW ================= */
  const handleReview = async (leaveId, status) => {
    const result = await confirmAlert.fire({
      title: `${status} Medical Leave?`,
      text:
        status === "Approved"
          ? "Approve this leave?"
          : "Reject this leave?",
      icon: "question",
      confirmButtonText: status,
      confirmButtonColor: status === "Approved" ? "#10b981" : "#ef4444",
      input: "textarea",
      inputLabel: "Remarks (optional)",
    });

    if (!result.isConfirmed) return;

    try {
      setReviewLoading(true);

      await api.patch(`/medical/coach/${leaveId}`, {
        status,
        coachRemarks: result.value || "",
      });

      successAlert(`Medical leave ${status.toLowerCase()} successfully`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      errorAlert("Failed to update medical leave");
    } finally {
      setReviewLoading(false);
    }
  };

const viewMC = async (leaveId) => {
  try {
    setPdfLoading(true);

    const res = await api.get(`/medical/file/${leaveId}`, {
      responseType: "blob",
    });

    const contentType = res.headers["content-type"];

    const blob = new Blob([res.data], { type: contentType });
    const url = URL.createObjectURL(blob);

    setPdfUrl(url);
    setFileType(contentType); 
    setZoom(1);
    setShowPdf(true);
  } catch (err) {
    console.error(err);
    errorAlert("Failed to open file");
  } finally {
    setPdfLoading(false);
  }
};
  const getStatusBadge = (status) => {
    if (status === "Approved") return <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm bg-opacity-75 border border-success">Approved</Badge>;
    if (status === "Rejected") return <Badge bg="danger" className="px-3 py-2 rounded-pill shadow-sm bg-opacity-75 border border-danger">Rejected</Badge>;
    return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill shadow-sm border border-warning">Pending</Badge>;
  };

  /* ================= TABLE ================= */
  const columns = [
    {
      key: "student",
      label: "Athlete",
      accessor: (row) => {
        const name = getDisplayName(row);
        const parts = name.split(" ");
        const initials = ((parts[0]?.charAt(0) || "") + (parts[1]?.charAt(0) || "")).toUpperCase();

        return (
          <div className="d-flex align-items-center gap-3 py-2">
            <div
              className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bolder"
              style={{ width: '42px', height: '42px', fontSize: '0.95rem' }}
            >
              {initials}
            </div>
            <div className="d-flex flex-column">
              <span className="fw-bolder text-dark" style={{ fontSize: '0.95rem' }}>{name}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "dates",
      label: "Leave Duration",
      accessor: (row) => (
        <div className="d-flex flex-column py-2">
          <span className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <FiCalendar size={14} className="text-primary"/>
            {moment(row.startDate).format("DD MMM YYYY")}
            {row.endDate &&
              row.endDate !== row.startDate &&
              ` - ${moment(row.endDate).format("DD MMM YYYY")}`}
          </span>
          <span className="text-muted small text-truncate" style={{ maxWidth: '250px' }} title={row.reason}>
            {row.reason}
          </span>
        </div>
      ),
    },
    {
      key: "document",
      label: "Medical Cert",
      accessor: (row) => (
        <Button 
          variant="light" 
          size="sm" 
          className="border shadow-sm text-primary fw-bold d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2" 
          onClick={() => viewMC(row._id)}
        >
          <FiFileText size={16}/> View MC
        </Button>
      ),
    },
    {
      key: "status",
      label: "Status",
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      key: "actions",
      label: "Actions",
      accessor: (row) =>
        row.status === "Pending" ? (
          <div className="d-flex align-items-center gap-2 py-2">
            <Button
              variant="success"
              size="sm"
              className="rounded-pill px-3 py-2 fw-bold shadow-sm border-0 d-flex align-items-center gap-2"
              onClick={() => handleReview(row._id, "Approved")}
              disabled={reviewLoading}
            >
              <FiCheckCircle size={16}/> Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="rounded-pill px-3 py-2 fw-bold shadow-sm border-0 d-flex align-items-center gap-2"
              onClick={() => handleReview(row._id, "Rejected")}
              disabled={reviewLoading}
            >
              <FiXCircle size={16}/> Reject
            </Button>
          </div>
        ) : (
          <span className="text-muted small fst-italic d-block py-2">Reviewed</span>
        ),
    },
  ];

  return (
    <div className="px-4 py-4">
      <HeroBanner
        title="Medical Leave Applications"
        subtitle="Review and verify student leave applications submitted to your squad."
      />

      <div className="row mb-4 g-4">
        <StatCard title="Pending" value={stats.pending} icon={<FiClock size={22}/>} iconBg="#fffbeb" iconColor="#d97706" />
        <StatCard title="Approved" value={stats.approved} icon={<FiCheckCircle size={22}/>} iconBg="#ecfdf5" iconColor="#10b981" />
        <StatCard title="Rejected" value={stats.rejected} icon={<FiXCircle size={22}/>} iconBg="#fef2f2" iconColor="#ef4444" />
      </div>

      <div className="mb-4">
        <FiltersCard
          search={search}
          setSearch={setSearch}
          searchPlaceholder="Search athlete name..."
          showYear={false}
          showClass={false} 
          showSport={false} 
          showStatus={false}
          showCategory={false}
          onReset={() => setSearch("")}
        />
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          Leave Applications
        </h5>

        <div className="bg-light p-1 rounded-pill d-inline-flex border shadow-sm flex-wrap gap-1">
          {["All", "Pending", "Approved", "Rejected"].map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted hover-dark"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        {filteredLeaves.length === 0 && !loading ? (
           <div className="text-center py-5 text-muted">
             <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
               <FiFileText size={28} className="text-slate-400 opacity-50" />
             </div>
             <h6 className="fw-bold mb-1 text-dark">No Applications Found</h6>
             <p className="mb-0 small">No leave records match your current filters.</p>
           </div>
        ) : (
           <Table 
             columns={columns} 
             data={filteredLeaves} 
             loading={loading} 
             itemsPerPage={10} 
           />
        )}
      </div>

      <Modal
  show={showPdf}
  onHide={() => {
    setShowPdf(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  }}
  size="xl"
>
  <Modal.Header closeButton className="border-bottom-0">
    <Modal.Title className="fw-bolder">
      Medical Certificate
    </Modal.Title>

    {/* 🔥 ACTION BUTTONS */}
    <div className="d-flex gap-2 ms-auto">

      {/* ZOOM IN */}
      <Button
        size="sm"
        variant="light"
        onClick={() => setZoom((z) => z + 0.2)}
      >
        +
      </Button>

      {/* ZOOM OUT */}
      <Button
        size="sm"
        variant="light"
        onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
      >
        -
      </Button>

      {/* DOWNLOAD */}
      <Button
        size="sm"
        variant="primary"
        onClick={() => {
          const a = document.createElement("a");
          a.href = pdfUrl;
          a.download = "medical-proof";
          a.click();
        }}
      >
        Download
      </Button>

      {/* FULLSCREEN */}
      <Button
        size="sm"
        variant="dark"
        onClick={() => window.open(pdfUrl, "_blank")}
      >
        Fullscreen
      </Button>

    </div>
  </Modal.Header>

  <Modal.Body
    style={{
      height: "80vh",
      padding: 0,
      background: "#f8fafc",
      overflow: "hidden",
    }}
  >
    {pdfLoading ? (
      <div className="d-flex justify-content-center align-items-center h-100">
        Loading...
      </div>
    ) : pdfUrl ? (
      fileType === "application/pdf" ? (
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={pdfUrl}
            alt="Medical Proof"
            style={{
              transform: `scale(${zoom})`,
              transition: "0.2s",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        </div>
      )
    ) : null}
  </Modal.Body>
</Modal>

      <style>{`
        .hover-dark:hover { color: #1e293b !important; }
      `}</style>
    </div>
  );
};

export default MedicalLeaveReview;