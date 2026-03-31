import React, { useEffect, useState, useRef } from "react";
import { Spinner, Alert, Button, Form, Row, Col, Card } from "react-bootstrap";
import api from "../api/axios";
import Swal from "sweetalert2";
import {
  FiCamera,
  FiUser,
  FiMail,
  FiCalendar,
  FiAward,
  FiActivity,
  FiInfo
} from "react-icons/fi";
import Avatar from "../components/Avatar"; // Reusing your Avatar component

const BACKEND_URL =
  import.meta.env.VITE_API_BASE?.replace("/api", "") ||
  "http://localhost:5000";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fileRef = useRef();

  const [role, setRole] = useState("student");
  const [selectedFile, setSelectedFile] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bod: "",
    profileUrl: "",
    age: "",
    height: "",
    weight: "",
    gender: "",
    formClass: "",
    sport: "",
    category: "",
    position: "",
  });

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      const user = res.data.data;

      setRole(user.role);

      const imageUrl = user.profileUrl
        ? user.profileUrl.startsWith("http")
          ? user.profileUrl
          : `${BACKEND_URL}${user.profileUrl}`
        : "";

      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bod: user.bod ? new Date(user.bod).toISOString().split("T")[0] : "",
        profileUrl: imageUrl,
        age: user.age || "",
        height: user.height || "",
        weight: user.weight || "",
        gender: user.gender || "-",
        formClass: user.classGroup || "-",
        sport: user.sport || "-",
        category: user.category || "-",
        position: user.position || "-",
      });
    } catch {
      setError("Failed to load profile data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE INPUT ================= */
  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ================= IMAGE ================= */
  const handleImageClick = () => fileRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return Swal.fire("Error", "Maximum file size is 2MB", "error");
    }

    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, profileUrl: preview }));
    setSelectedFile(file);
  };

  /* ================= SAVE ================= */
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      if (selectedFile) {
        const fd = new FormData();
        fd.append("avatar", selectedFile);
        const res = await api.post("/users/me/avatar", fd);
        const newUrl = res.data.data.profileUrl;
        setForm((prev) => ({
          ...prev,
          profileUrl: `${BACKEND_URL}${newUrl}`,
        }));
        setSelectedFile(null);
      }

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        bod: form.bod,
      };

      if (role === "coach") payload.age = form.age;
      if (role === "student") {
        payload.height = form.height;
        payload.weight = form.weight;
      }

      const res = await api.put("/users/me", payload);
      const updated = res.data.data;

      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));

      Swal.fire({
        title: "Success",
        text: "Your profile has been updated.",
        icon: "success",
        confirmButtonColor: "#0d6efd"
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Update failed",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (form.profileUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(form.profileUrl);
      }
    };
  }, [form.profileUrl]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim();

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1200px' }}>
      {/* Inline styles for enterprise UI elements */}
      <style>{`
        .cover-photo {
          height: 160px;
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        .profile-avatar-wrapper {
          position: absolute;
          top: -65px;
          left: 32px;
          cursor: pointer;
          border-radius: 50%;
          border: 4px solid #fff;
          background: #fff;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow: hidden;
          width: 130px;
          height: 130px;
        }
        .profile-avatar-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
        }
        .profile-avatar-wrapper:hover .avatar-overlay {
          opacity: 1;
        }
        .enterprise-card {
          box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075);
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 0.5rem;
        }
        .form-label {
          font-weight: 500;
          color: #495057;
          font-size: 0.9rem;
        }
        .readonly-value {
          font-size: 1rem;
          font-weight: 500;
          color: #212529;
        }
      `}</style>

      {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

      {/* ================= HEADER / BANNER SECTION ================= */}
      <Card className="enterprise-card mb-4 border-0">
        <div className="cover-photo"></div>
        <Card.Body className="position-relative px-4 pb-4" style={{ paddingTop: '80px' }}>
          
          <div className="profile-avatar-wrapper" onClick={handleImageClick}>
            {form.profileUrl ? (
              <img src={form.profileUrl} alt="Profile" />
            ) : (
              <div style={{ width: '100%', height: '100%' }}>
                <Avatar name={fullName || "User"} size={122} />
              </div>
            )}
            <div className="avatar-overlay">
              <FiCamera size={28} />
            </div>
          </div>
          
          <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleImageChange} />

          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2 className="fw-bold mb-1">{fullName || "Unknown User"}</h2>
              <p className="text-muted mb-2 text-capitalize d-flex align-items-center gap-2">
                <FiAward /> {role} {form.sport !== "-" && `• ${form.sport}`}
              </p>
            </div>
            <Button 
              variant="primary" 
              className="px-4 fw-semibold rounded-pill shadow-sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ================= MAIN CONTENT LAYOUT ================= */}
      <Form onSubmit={handleSave}>
        <Row className="g-4">
          
          {/* LEFT COLUMN: EDITABLE INFO */}
          <Col lg={8}>
            <Card className="enterprise-card border-0 h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom">
                  <FiUser className="text-primary fs-5" />
                  <h5 className="mb-0 fw-bold">Personal Information</h5>
                </div>

                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        className="bg-light border-0 py-2"
                        value={form.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        placeholder="e.g. John"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        className="bg-light border-0 py-2"
                        value={form.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        placeholder="e.g. Doe"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Email Address</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0 text-muted"><FiMail /></span>
                        <Form.Control
                          className="bg-light border-0 py-2"
                          type="email"
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                        />
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Date of Birth</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0 text-muted"><FiCalendar /></span>
                        <Form.Control
                          className="bg-light border-0 py-2"
                          type="date"
                          value={form.bod}
                          onChange={(e) => updateField("bod", e.target.value)}
                        />
                      </div>
                    </Form.Group>
                  </Col>

                  {/* ROLE SPECIFIC FIELDS */}
                  {role === "coach" && (
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Age</Form.Label>
                        <Form.Control
                          className="bg-light border-0 py-2"
                          type="number"
                          value={form.age}
                          onChange={(e) => updateField("age", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  )}

                  {role === "student" && (
                    <>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Height (cm)</Form.Label>
                          <Form.Control
                            className="bg-light border-0 py-2"
                            type="number"
                            value={form.height}
                            onChange={(e) => updateField("height", e.target.value)}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Weight (kg)</Form.Label>
                          <Form.Control
                            className="bg-light border-0 py-2"
                            type="number"
                            value={form.weight}
                            onChange={(e) => updateField("weight", e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT COLUMN: READ-ONLY SYSTEM INFO */}
          <Col lg={4}>
            <Card className="enterprise-card border-0 h-100 bg-light bg-opacity-50">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom">
                  <FiInfo className="text-primary fs-5" />
                  <h5 className="mb-0 fw-bold">System Details</h5>
                </div>

                <div className="mb-4">
                  <p className="text-muted mb-1 small text-uppercase fw-semibold">Sport</p>
                  <p className="readonly-value d-flex align-items-center gap-2">
                    <FiActivity className="text-secondary" /> 
                    {form.sport !== "-" ? form.sport : "Not Assigned"}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-muted mb-1 small text-uppercase fw-semibold">Category</p>
                  <p className="readonly-value">
                    {form.category !== "-" ? form.category : "N/A"}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-muted mb-1 small text-uppercase fw-semibold">Position</p>
                  <p className="readonly-value">
                    {form.position !== "-" ? form.position : "N/A"}
                  </p>
                </div>

                {role === "student" && (
                  <div>
                    <p className="text-muted mb-1 small text-uppercase fw-semibold">Form Class</p>
                    <p className="readonly-value">
                      {form.formClass !== "-" ? form.formClass : "N/A"}
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Form>
    </div>
  );
}