import { useState, useEffect, useMemo } from "react";
import { Row, Col, Button, Modal, Pagination } from "react-bootstrap";
import { 
  FiPlus, FiClock, FiCheckCircle, FiXCircle, 
  FiFileText, FiTrash2, FiCalendar, FiActivity 
} from "react-icons/fi";
import moment from "moment";

import axios from "../../api/axios";
import MedicalLeaveForm from "../../components/student/MedicalLeaveForm";
import HeroBanner from "../../components/HeroBanner";
import { successAlert, errorAlert } from "../../utils/swal";

const StudentMedicalPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // File Preview State
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [showFile, setShowFile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  /* ================= LOAD PROFILE ================= */
  const loadProfile = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUserId(res.data._id);
      loadLeaves(res.data._id);
    } catch {
      errorAlert("Failed to load user profile");
    }
  };

  /* ================= LOAD LEAVES ================= */
  const loadLeaves = async (id) => {
    try {
      const res = await axios.get(`/leave/student/${id}`);
      setLeaves(res.data.leaves || []);
    } catch {
      errorAlert("Failed to load medical leaves");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (formData) => {
    try {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("startDate", formData.startDate);
      fd.append("endDate", formData.endDate);
      fd.append("reason", formData.reason);
      fd.append("file", formData.mcFile);

      await axios.post("/leave/student", fd);

      successAlert("Medical leave submitted");
      setShowForm(false);
      loadLeaves(userId);
    } catch {
      errorAlert("Failed to submit medical leave");
    }
  };

  /* ================= DELETE ================= */
  const deleteLeave = async (leaveId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await axios.delete(`/leave/student/${leaveId}`);
      successAlert("Leave application withdrawn");
      loadLeaves(userId);
    } catch {
      errorAlert("Failed to withdraw leave");
    }
  };

  /* ================= VIEW FILE ================= */
  const viewMC = async (leaveId) => {
    try {
      const res = await axios.get(`/medical/file/${leaveId}`, {
        responseType: "blob",
      });

      const contentType = res.headers["content-type"];
      const blob = new Blob([res.data], { type: contentType });
      const url = URL.createObjectURL(blob);

      setFileUrl(url);
      setFileType(contentType);
      setShowFile(true);
    } catch (err) {
      errorAlert("Failed to open medical certificate file");
    }
  };

  /* ================= FILTER & PAGINATION ================= */
  const filteredLeaves = useMemo(() => {
    if (activeTab === "All") return leaves;
    return leaves.filter((l) => l.status === activeTab);
  }, [leaves, activeTab]);

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeaves.slice(start, start + itemsPerPage);
  }, [filteredLeaves, currentPage]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter((l) => l.status === "Pending").length,
      approved: leaves.filter((l) => l.status === "Approved").length,
      rejected: leaves.filter((l) => l.status === "Rejected").length,
    };
  }, [leaves]);

  /* ================= UI HELPERS ================= */
  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved": return <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 border border-success border-opacity-25"><FiCheckCircle className="me-1"/> Approved</span>;
      case "Rejected": return <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 border border-danger border-opacity-25"><FiXCircle className="me-1"/> Rejected</span>;
      default: return <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2 border border-warning border-opacity-25"><FiClock className="me-1"/> Pending</span>;
    }
  };

  const tabs = ["All", "Pending", "Approved", "Rejected"];

  /* ================= UI ================= */
  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      
      {/* HEADER ROW - INTEGRATED BUTTON */}
      <div className="mb-4">
        <HeroBanner
          title="Medical Leave Applications"
          subtitle="Submit MCs and track the approval status of your medical leaves."
          buttonText="Submit Leave"
          buttonIcon={FiPlus}
          onButtonClick={() => setShowForm(true)}
        />
      </div>

      {/* KPI STATS */}
      <Row className="g-4 mb-4">
        <Col xs={6} md={3}>
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary me-3 d-none d-xl-block"><FiActivity size={24} /></div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold letter-spacing-1">Total</p>
              <h3 className="fw-bold mb-0 text-dark">{stats.total}</h3>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
            <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning me-3 d-none d-xl-block"><FiClock size={24} /></div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold letter-spacing-1">Pending</p>
              <h3 className="fw-bold mb-0 text-dark">{stats.pending}</h3>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
            <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success me-3 d-none d-xl-block"><FiCheckCircle size={24} /></div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold letter-spacing-1">Approved</p>
              <h3 className="fw-bold mb-0 text-dark">{stats.approved}</h3>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
            <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger me-3 d-none d-xl-block"><FiXCircle size={24} /></div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold letter-spacing-1">Rejected</p>
              <h3 className="fw-bold mb-0 text-dark">{stats.rejected}</h3>
            </div>
          </div>
        </Col>
      </Row>

      {/* TABLE CONTROLS - EXTRACTED OUTSIDE THE CARD */}
      <div className="d-flex justify-content-start mb-3">
        <div className="bg-white p-1 rounded-pill d-inline-flex border shadow-sm flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
                activeTab === tab ? "bg-primary text-white shadow-sm" : "bg-transparent text-muted hover-dark"
              }`}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* DATA TABLE CONTAINER */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="px-4 py-3 fw-bold border-bottom-0 letter-spacing-1">Duration / Dates</th>
                <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Reason</th>
                <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Proof (MC)</th>
                <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Status</th>
                <th className="px-4 py-3 fw-bold border-bottom-0 text-end letter-spacing-1">Action</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="spinner-border text-primary spinner-border-sm me-2" /> Loading records...
                  </td>
                </tr>
              ) : paginatedLeaves.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="p-3 bg-light rounded-circle d-inline-block mb-3">
                      <FiFileText size={24} className="opacity-50" />
                    </div>
                    <p className="mb-0 fw-bold text-dark">No leave applications found</p>
                    <small>Click "Submit Leave" to upload a new medical certificate.</small>
                  </td>
                </tr>
              ) : (
                paginatedLeaves.map((l) => (
                  <tr key={l._id}>
                    {/* DATES */}
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-light-primary text-primary rounded-3 p-2 me-3 d-none d-sm-block">
                          <FiCalendar size={18} />
                        </div>
                        <div>
                          <div className="fw-bold text-dark">
                            {moment(l.startDate).format("DD MMM YYYY")}
                          </div>
                          {l.endDate && l.endDate !== l.startDate && (
                            <div className="text-muted small">
                              to {moment(l.endDate).format("DD MMM YYYY")}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* REASON */}
                    <td className="py-3">
                      <div className="text-dark text-truncate" style={{ maxWidth: '250px' }} title={l.reason}>
                        {l.reason}
                      </div>
                    </td>

                    {/* MEDICAL CERTIFICATE */}
                    <td className="py-3">
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="border shadow-sm text-primary fw-bold rounded-pill px-3 py-1 d-inline-flex align-items-center"
                        onClick={() => viewMC(l._id)}
                      >
                        <FiFileText className="me-2" /> View MC
                      </Button>
                    </td>

                    {/* STATUS */}
                    <td className="py-3">
                      {getStatusBadge(l.status)}
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-3 text-end">
                      {l.status === "Pending" ? (
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="rounded-circle p-2"
                          onClick={() => deleteLeave(l._id)}
                          title="Withdraw Application"
                        >
                          <FiTrash2 />
                        </Button>
                      ) : (
                        <span className="text-muted small fst-italic">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && filteredLeaves.length > 0 && (
          <div className="card-footer bg-white border-top p-3 px-4 d-flex flex-wrap justify-content-between align-items-center">
            <span className="text-muted small">
              Showing <span className="fw-bold text-dark">{paginatedLeaves.length}</span> of <span className="fw-bold text-dark">{filteredLeaves.length}</span> records
            </span>
            <Pagination className="mb-0 shadow-sm">
              <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p - 1)} />
            </Pagination>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      <MedicalLeaveForm
        show={showForm}
        onHide={() => setShowForm(false)}
        onSubmit={handleSubmit}
      />

      {/* FILE PREVIEW MODAL */}
      <Modal
        show={showFile}
        onHide={() => {
          setShowFile(false);
          if (fileUrl) URL.revokeObjectURL(fileUrl);
        }}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="fw-bold">Medical Certificate</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light p-0 d-flex justify-content-center align-items-center" style={{ height: "80vh", overflow: "hidden" }}>
          {fileUrl && (
            <>
              {fileType?.includes("pdf") ? (
                <iframe
                  src={fileUrl}
                  title="Medical Proof PDF"
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              ) : (
                <img
                  src={fileUrl}
                  alt="Medical Proof"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              )}
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* STYLES */}
      <style>{`
        .hover-dark:hover { color: #1e293b !important; }
        .letter-spacing-1 { letter-spacing: 0.5px; }
        .bg-light-primary { background-color: rgba(13, 110, 253, 0.1); }
      `}</style>
    </div>
  );
};

export default StudentMedicalPage;