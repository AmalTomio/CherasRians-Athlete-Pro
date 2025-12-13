import React, { useState } from "react";
import { Modal, Button, Form, Row, Col, Card } from "react-bootstrap";
import {
  ExclamationTriangle,
  InfoCircle,
  Upload,
  CheckCircle,
} from "react-bootstrap-icons";

const MedicalLeaveForm = ({ show, onHide, onSubmit }) => {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    mcFile: null,
  });

  const [dragActive, setDragActive] = useState(false);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    setFormData({ ...formData, mcFile: file });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDrag = (e) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleSubmit = () => {
    if (!formData.mcFile) {
      alert("Please upload a Medical Certificate (PDF).");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      {/* HEADER */}
      <div
        className="w-100 d-flex align-items-center justify-content-between px-4 py-3"
        style={{ backgroundColor: "#0d6efd", color: "white" }}
      >
        <h5 className="m-0">Submit Medical Leave Application</h5>
        <Button variant="light" size="sm" onClick={onHide}>
          X
        </Button>
      </div>

      {/* BODY */}
      <Modal.Body className="px-4">
        {/* Warning Block */}
        <div
          className="p-3 mb-4 border rounded d-flex align-items-start"
          style={{ backgroundColor: "#fff9e6", borderColor: "#ffe7a3" }}
        >
          <ExclamationTriangle className="text-warning me-2 mt-1" size={20} />
          <span className="text-warning fw-semibold">
            Ensure your Medical Certificate (MC) is valid and issued by a
            licensed clinic.
          </span>
        </div>

        {/* Form Section */}
        <Row className="g-4">
          {/* Left Column */}
          <Col md={6}>
            <Card className="p-3 shadow-sm border rounded">
              <h6 className="fw-semibold mb-3">Leave Details</h6>

              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInput}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInput}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Reason</Form.Label>
                <Form.Control
                  as="textarea"
                  name="reason"
                  rows={4}
                  placeholder="Describe your medical condition..."
                  value={formData.reason}
                  onChange={handleInput}
                />
              </Form.Group>
            </Card>
          </Col>

          {/* Right Column */}
          <Col md={6}>
            <Card className="p-3 shadow-sm border rounded">
              <h6 className="fw-semibold mb-3">Medical Certificate (PDF)</h6>

              {/* Drag and Drop Zone */}
              <div
                onClick={() => document.getElementById("fileInput").click()}
                onDragEnter={onDrag}
                onDragOver={onDrag}
                onDragLeave={onDrag}
                onDrop={onDrop}
                className="p-4 text-center border border-2 rounded"
                style={{
                  borderStyle: dragActive ? "solid" : "dashed",
                  borderColor: dragActive ? "#0d6efd" : "#999",
                  backgroundColor: dragActive ? "#eef6ff" : "#fafafa",
                  cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  className="d-none"
                  id="fileInput"
                  onChange={(e) => handleFile(e.target.files[0])}
                />

                {!formData.mcFile ? (
                  <div>
                    <Upload size={40} className="text-secondary mb-2" />
                    <p className="m-0 fw-semibold">
                      Click or drag your PDF file here
                    </p>
                    <small className="text-muted">
                      Only PDF. Max size: 10MB
                    </small>
                  </div>
                ) : (
                  <div>
                    <CheckCircle size={40} className="text-success mb-2" />
                    <p className="fw-semibold text-dark">
                      {formData.mcFile.name}
                    </p>
                    <small className="text-muted">
                      {(formData.mcFile.size / 1024 / 1024).toFixed(2)} MB
                    </small>

                    <div className="mt-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          setFormData({ ...formData, mcFile: null })
                        }
                      >
                        Remove File
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Instructions Block */}
            <div
              className="p-3 mt-3 border rounded d-flex align-items-start"
              style={{ backgroundColor: "#e9f6ff", borderColor: "#b3e0ff" }}
            >
              <InfoCircle className="text-info me-2 mt-1" size={20} />
              <span className="text-info">
                Your submission will be reviewed by your coach. You will be
                notified once approved or rejected.
              </span>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer className="d-flex justify-content-between px-4">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>

        <Button
          style={{ backgroundColor: "#0d6efd" }}
          disabled={!formData.mcFile}
          onClick={handleSubmit}
        >
          Submit Medical Leave
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MedicalLeaveForm;
