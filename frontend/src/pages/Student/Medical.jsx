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
    try {
      await axios.delete(`/leave/student/${leaveId}`);
      successAlert("Leave deleted");
      loadLeaves(userId);
    } catch {
      errorAlert("Failed to delete leave");
    }
  };

  /* ================= FILTER ================= */
  const filtered = () => {
    if (activeTab === "all") return leaves;

    return leaves.filter(
      (l) =>
        l.status ===
        activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
    );
  };

  /* ================= VIEW FILE (FIXED) ================= */
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
      errorAlert("Failed to open file");
    }
  };

  /* ================= STATS ================= */
  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  /* ================= UI ================= */
  return (
    <div className="px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Medical Leave Applications</h1>
          <p className="text-muted">
            Submit and track your medical leave applications.
          </p>
        </div>

        <Button onClick={() => setShowForm(true)}>
          + Submit Medical Leave
        </Button>
      </div>

      {/* STATS */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="p-3">
            <p>Total</p>
            <h4>{stats.total}</h4>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="p-3">
            <p>Pending</p>
            <h4 className="text-warning">{stats.pending}</h4>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="p-3">
            <p>Approved</p>
            <h4 className="text-success">{stats.approved}</h4>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="p-3">
            <p>Rejected</p>
            <h4 className="text-danger">{stats.rejected}</h4>
          </Card>
        </Col>
      </Row>

      {/* TABS */}
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
            <div className="spinner-border" />
          </div>
        ) : filtered().length === 0 ? (
          <Card className="text-center py-5">
            <p>No applications found.</p>
          </Card>
        ) : (
          filtered().map((leave) => (
            <LeaveCard
              key={leave._id}
              leave={leave}
              role="student"
              onDelete={deleteLeave}
              onViewMC={viewMC}
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
        show={showFile}
        onHide={() => {
          setShowFile(false);
          if (fileUrl) URL.revokeObjectURL(fileUrl);
        }}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Medical Proof</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ height: "80vh" }}>
          {fileUrl && (
            <>
              {fileType?.includes("pdf") ? (
                <iframe
                  src={fileUrl}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              ) : (
                <img
                  src={fileUrl}
                  alt="Medical Proof"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentMedicalPage;