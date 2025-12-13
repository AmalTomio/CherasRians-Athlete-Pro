import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Row, Col, Card, Nav, Tab, Modal } from "react-bootstrap";
import LeaveCard from "../../components/student/LeaveCard";
import { successAlert, errorAlert, confirmAlert } from "../../utils/swal";

const MedicalLeaveReview = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  /* ================= FETCH ALL COACH LEAVES ================= */
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get("/medical/coach");
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error(err);
      errorAlert("Failed to load medical leave applications");
    } finally {
      setLoading(false);
    }
  };

  /* ================= REVIEW ================= */
  const handleReview = async (leaveId, status) => {
    const result = await confirmAlert.fire({
      title: `${status} Medical Leave?`,
      text:
        status === "Approved"
          ? "Are you sure you want to approve this medical leave?"
          : "Are you sure you want to reject this medical leave?",
      icon: "question",
      confirmButtonText: status === "Approved" ? "Approve" : "Reject",
      confirmButtonColor: status === "Approved" ? "#28a745" : "#dc3545",
      input: "textarea",
      inputLabel: "Remarks (optional)",
      inputPlaceholder: "Enter remarks for the student...",
    });

    if (!result.isConfirmed) return;

    try {
      setReviewLoading(true);

      await api.patch(`/medical/coach/${leaveId}`, {
        status,
        coachRemarks: result.value || "",
      });

      successAlert(`Medical leave ${status.toLowerCase()} successfully`);
      fetchLeaves(); // refresh list
    } catch (err) {
      console.error("Review error:", err);
      errorAlert(
        err.response?.data?.message || "Failed to update medical leave"
      );
    } finally {
      setReviewLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredLeaves = () => {
    if (activeTab === "all") return leaves;
    return leaves.filter((l) => l.status.toLowerCase() === activeTab);
  };

  /* ================= STATS ================= */
  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  const viewMC = async (leaveId) => {
    try {
      setPdfLoading(true);

      const res = await api.get(`/medical/file/${leaveId}`, {
        responseType: "blob",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const pdfBlob = new Blob([res.data], {
        type: res.headers["content-type"] || "application/pdf",
      });

      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setShowPdf(true);
    } catch (err) {
      console.error(err);
      errorAlert("Failed to open medical certificate");
    }
  };

  return (
    <div className="px-4 py-4 w-100">
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="mb-2">Medical Leave Applications</h1>
        <p className="text-muted">
          Review and verify student medical leave applications
        </p>
      </div>
      {/* STATS */}
      <Row className="mb-4 gy-3">
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <p className="text-muted mb-1">Total</p>
            <h4>{stats.total}</h4>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <p className="text-muted mb-1">Pending</p>
            <h4 className="text-warning">{stats.pending}</h4>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <p className="text-muted mb-1">Approved</p>
            <h4 className="text-success">{stats.approved}</h4>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <p className="text-muted mb-1">Rejected</p>
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
            <div className="spinner-border text-primary" />
          </div>
        ) : filteredLeaves().length === 0 ? (
          <Card className="shadow-sm text-center py-5">
            <p className="text-muted mb-0">
              No medical leave applications found.
            </p>
          </Card>
        ) : (
          filteredLeaves().map((leave) => (
            <LeaveCard
              key={leave._id}
              leave={leave}
              role="coach"
              onViewMC={viewMC}
              onReview={handleReview}
            />
          ))
        )}
      </Tab.Container>
      <Modal
        show={showPdf}
        onHide={() => {
          setShowPdf(false);
          setPdfLoading(false);

          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
          }
        }}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Medical Certificate</Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{ height: "80vh", padding: 0, position: "relative" }}
        >
          {/* SKELETON LOADER */}
          {pdfLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#f8f9fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <div style={{ width: "60%" }}>
                <div className="placeholder-glow mb-3">
                  <div
                    className="placeholder col-12"
                    style={{ height: "20px" }}
                  />
                </div>
                <div className="placeholder-glow mb-3">
                  <div
                    className="placeholder col-10"
                    style={{ height: "20px" }}
                  />
                </div>
                <div className="placeholder-glow mb-3">
                  <div
                    className="placeholder col-8"
                    style={{ height: "20px" }}
                  />
                </div>
                <div className="placeholder-glow">
                  <div
                    className="placeholder col-6"
                    style={{ height: "20px" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* PDF IFRAME */}
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="Medical Certificate"
              width="100%"
              height="100%"
              style={{
                border: "none",
                visibility: pdfLoading ? "hidden" : "visible",
              }}
              onLoad={() => setPdfLoading(false)}
            />
          )}
        </Modal.Body>
      </Modal>
      ;
    </div>
  );
};

export default MedicalLeaveReview;
