import { useState, useEffect } from "react";
import axios from "../../api/axios";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Nav,
  Tab,
  Modal,
} from "react-bootstrap";
import MedicalLeaveForm from "../../components/student/MedicalLeaveForm";
import LeaveCard from "../../components/student/LeaveCard";
import { successAlert, errorAlert } from "../../utils/swal";

const StudentMedicalPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUserId(res.data._id);
      loadLeaves(res.data._id);
    } catch {
      errorAlert("Failed to load user profile");
    }
  };

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

  const deleteLeave = async (leaveId) => {
    try {
      await axios.delete(`/leave/student/${leaveId}`);
      successAlert("Leave deleted");
      loadLeaves(userId);
    } catch {
      errorAlert("Failed to delete leave");
    }
  };

  const filtered = () => {
    if (activeTab === "all") return leaves;
    return leaves.filter(
      (l) => l.status === activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
    );
  };

  const handleViewMC = async (leaveId) => {
    try {
      const res = await axios.get(`/medical/file/${leaveId}`, {
        responseType: "blob", // IMPORTANT
      });

      const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      const fileUrl = URL.createObjectURL(pdfBlob);

      setPdfUrl(fileUrl);
      setShowPdf(true);
    } catch (err) {
      console.error(err);
      errorAlert("Failed to load PDF file");
    }
  };

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  return (
    <div
      className="student-medical-wrapper"
      style={{ padding: "24px 24px", boxSizing: "border-box" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-2">Medical Leave Applications</h1>
          <p className="text-muted">
            Submit and track your medical leave applications with MC
            documentation.
          </p>
        </div>

        <Button
          className="px-3 py-2 fw-semibold"
          style={{ fontSize: "14px" }}
          onClick={() => setShowForm(true)}
        >
          + Submit Medical Leave
        </Button>
      </div>

      {/* Stats Row */}
      <Row className="mb-4 gy-3">
        <Col md={3}>
          <Card className="p-3 shadow-sm border">
            <p className="text-muted mb-1">Total Applications</p>
            <h4>{stats.total}</h4>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm border">
            <p className="text-muted mb-1">Pending</p>
            <h4 className="text-warning">{stats.pending}</h4>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm border">
            <p className="text-muted mb-1">Approved</p>
            <h4 className="text-success">{stats.approved}</h4>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm border">
            <p className="text-muted mb-1">Rejected</p>
            <h4 className="text-danger">{stats.rejected}</h4>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="pills" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="all">All</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="pending">Pending</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="approved">Approved</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="rejected">Rejected</Nav.Link>
          </Nav.Item>
        </Nav>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : filtered().length === 0 ? (
          <Card className="shadow-sm text-center py-5">
            <p className="text-muted mb-0">No applications found.</p>
          </Card>
        ) : (
          filtered().map((leave) => (
            <LeaveCard
              key={leave._id}
              leave={leave}
              role="student"
              onDelete={deleteLeave}
              onViewMC={handleViewMC}
            />
          ))
        )}
      </Tab.Container>

      <MedicalLeaveForm
        show={showForm}
        onHide={() => setShowForm(false)}
        onSubmit={handleSubmit}
      />

      <Modal
        show={showPdf}
        onHide={() => {
          setShowPdf(false);
          URL.revokeObjectURL(pdfUrl);
        }}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Medical Certificate</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ height: "80vh" }}>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="MC Document"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentMedicalPage;
