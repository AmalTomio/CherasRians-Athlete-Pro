import React, { useEffect, useState, useRef } from "react";
import { Spinner, Alert, Button, Form, Row, Col } from "react-bootstrap";
import api from "../api/axios";
import Swal from "sweetalert2";
import { FiCamera, FiEdit2, FiX } from "react-icons/fi";
import Avatar from "../components/Avatar";
import HeroBanner from "../components/HeroBanner";
import { formatSportName } from "../utils/format";

const BACKEND_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

      const imageUrl = user.profileUrl || "";
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

    if (file.size > 5 * 1024 * 1024) {
      return Swal.fire("Error", "Maximum file size is 5MB", "error");
    }

    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, profileUrl: preview }));
    setSelectedFile(file);

    // Auto-save image to mimic seamless profile picture updates
    handleImageUpload(file);
  };

  const handleImageUpload = async (file) => {
    try {
      const fd = new FormData();
      fd.append("avatar", file);

      const res = await api.post("/users/me/avatar", fd);

      const updatedUser = res.data.data;

      const imageUrl = updatedUser.profileUrl || "";

      setForm((prev) => ({
        ...prev,
        profileUrl: imageUrl,
      }));

      setSelectedFile(null);

      Swal.fire({
        title: "Success",
        text: "Profile picture updated.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Error", "Failed to update profile picture.", "error");
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
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
        confirmButtonColor: "#0d6efd",
      });
      setIsEditing(false);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Update failed",
        "error",
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
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim();

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      {/* Custom Styles matching the reference image */}
      <style>{`
        .section-title { 
          color: #114232; 
          font-weight: 600; 
          font-size: 1.15rem; 
        }
        
        .clean-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          margin-bottom: 1.5rem;
          padding: 1.75rem 2rem;
        }

        .avatar-container {
          position: relative;
          width: 90px;
          height: 90px;
          cursor: pointer;
        }
        
        /* Force circular rendering for the avatar */
        .avatar-wrapper {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background-color: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .camera-badge {
          position: absolute;
          bottom: 0px;
          right: 0px;
          background-color: #114232;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          font-size: 13px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .info-label {
          font-size: 0.85rem;
          color: #888;
          font-weight: 500;
          margin-bottom: 0.4rem;
        }

        .info-value {
          font-size: 1rem;
          color: #212529;
          font-weight: 600;
          margin-bottom: 1.75rem;
        }

        .btn-edit-orange {
          background-color: #e87b1e;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.85rem;
          padding: 0.4rem 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s;
        }
        .btn-edit-orange:hover {
          background-color: #d16915;
          color: white;
        }
        
        .form-control {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 0.5rem 1rem;
        }
        .form-control:focus {
          box-shadow: none;
          border-color: #114232;
        }
      `}</style>

      {/* REUSED HEROBANNER COMPONENT */}
      <HeroBanner
        title="My Profile"
        subtitle="Manage your personal information, contact details, and system preferences."
      />

      {error && (
        <Alert variant="danger" className="border-0 shadow-sm mt-4">
          {error}
        </Alert>
      )}

      <div className="mt-4">
        {/* ================= CARD 1: HEADER ================= */}
        <div className="clean-card d-flex align-items-center gap-4">
          <div className="avatar-container" onClick={handleImageClick}>
            <div className="avatar-wrapper shadow-sm">
              {form.profileUrl ? (
                <img src={form.profileUrl} alt="Profile" />
              ) : (
                <Avatar name={fullName || "User"} size={90} round={true} />
              )}
            </div>
            <div className="camera-badge">
              <FiCamera />
            </div>
          </div>
          <input
            type="file"
            ref={fileRef}
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />

          <div>
            <h5 className="fw-bold text-dark mb-1">
              {fullName || "Unknown User"}
            </h5>
            <div className="text-muted small text-capitalize mb-1">{role}</div>
            <div className="text-muted small">
              {role === "student" && (
                <>
                  {form.sport !== "-"
                    ? formatSportName(form.sport)
                    : "No Sport Assigned"}
                  {form.formClass !== "-" ? `, ${form.formClass}` : ""}
                </>
              )}

              {role === "coach" && (
                <>
                  {form.sport !== "-"
                    ? formatSportName(form.sport)
                    : "No Sport Assigned"}
                  {form.category !== "-" ? ` • ${form.category}` : ""}
                </>
              )}

              {role === "exco" && <>Sports Administration</>}
            </div>
          </div>
        </div>

        {/* ================= CARD 2: PERSONAL INFORMATION ================= */}
        <div className="clean-card">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="section-title mb-0">Personal Information</h5>
            {!isEditing ? (
              <button
                className="btn-edit-orange"
                onClick={() => setIsEditing(true)}
              >
                Edit <FiEdit2 size={14} />
              </button>
            ) : (
              <button
                className="btn btn-sm btn-light text-muted fw-bold border"
                onClick={() => setIsEditing(false)}
              >
                Cancel <FiX size={16} />
              </button>
            )}
          </div>

          {isEditing ? (
            /* EDIT MODE FORM */
            <Form onSubmit={handleSave}>
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label className="info-label">First Name</Form.Label>
                    <Form.Control
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label className="info-label">Last Name</Form.Label>
                    <Form.Control
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label className="info-label">
                      Date of Birth
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={form.bod}
                      onChange={(e) => updateField("bod", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label className="info-label">
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                {role === "coach" ? (
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label className="info-label">Age</Form.Label>
                      <Form.Control
                        type="number"
                        value={form.age}
                        onChange={(e) => updateField("age", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                ) : (
                  <>
                    <Col md={4} className="mb-3">
                      <Form.Group>
                        <Form.Label className="info-label">
                          Height (cm)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={form.height}
                          onChange={(e) =>
                            updateField("height", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Group>
                        <Form.Label className="info-label">
                          Weight (kg)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={form.weight}
                          onChange={(e) =>
                            updateField("weight", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}
              </Row>
              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="success"
                  type="submit"
                  className="px-4 fw-bold"
                  style={{ backgroundColor: "#114232", borderColor: "#114232" }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          ) : (
            /* READ-ONLY GRID */
            <Row>
              <Col md={4}>
                <div className="info-label">First Name</div>
                <div className="info-value">{form.firstName || "-"}</div>
                <div className="info-label">Email Address</div>
                <div className="info-value mb-md-0">{form.email || "-"}</div>
              </Col>
              <Col md={4}>
                <div className="info-label">Last Name</div>
                <div className="info-value">{form.lastName || "-"}</div>
                {role === "coach" ? (
                  <>
                    <div className="info-label">Age</div>
                    <div className="info-value mb-md-0">{form.age || "-"}</div>
                  </>
                ) : (
                  <>
                    <div className="info-label">Height</div>
                    <div className="info-value mb-md-0">
                      {form.height ? `${form.height} cm` : "-"}
                    </div>
                  </>
                )}
              </Col>
              <Col md={4}>
                <div className="info-label">Date of Birth</div>
                <div className="info-value">
                  {form.bod
                    ? new Date(form.bod)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        .replace(/ /g, "-")
                    : "-"}
                </div>
                {role === "student" && (
                  <>
                    <div className="info-label">Weight</div>
                    <div className="info-value mb-md-0">
                      {form.weight ? `${form.weight} kg` : "-"}
                    </div>
                  </>
                )}
              </Col>
            </Row>
          )}
        </div>

        {/* ================= CARD 3: SYSTEM DETAILS ================= */}
        <div className="clean-card mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="section-title mb-0">System Details</h5>
          </div>

          {/* ================= STUDENT ================= */}
          {role === "student" && (
            <Row>
              <Col md={3}>
                <div className="info-label">Sport</div>
                <div className="info-value">
                  {form.sport !== "-"
                    ? formatSportName(form.sport)
                    : "Not Assigned"}
                </div>
              </Col>

              <Col md={3}>
                <div className="info-label">Category</div>
                <div className="info-value">
                  {form.category !== "-" ? form.category : "N/A"}
                </div>
              </Col>

              <Col md={3}>
                <div className="info-label">Position</div>
                <div className="info-value">
                  {form.position !== "-" ? form.position : "N/A"}
                </div>
              </Col>

              <Col md={3}>
                <div className="info-label">Form Class</div>
                <div className="info-value">
                  {form.formClass !== "-" ? form.formClass : "N/A"}
                </div>
              </Col>
            </Row>
          )}

          {/* ================= COACH ================= */}
          {role === "coach" && (
            <Row>
              <Col md={4}>
                <div className="info-label">Assigned Sport</div>
                <div className="info-value">
                  {form.sport !== "-"
                    ? formatSportName(form.sport)
                    : "Not Assigned"}
                </div>
              </Col>

              <Col md={4}>
                <div className="info-label">Assigned Category</div>
                <div className="info-value">
                  {form.category !== "-" ? form.category : "N/A"}
                </div>
              </Col>

              <Col md={4}>
                <div className="info-label">Account Status</div>
                <div className="info-value text-success">Active</div>
              </Col>
            </Row>
          )}

          {/* ================= EXCO ================= */}
          {role === "exco" && (
            <Row>
              <Col md={4}>
                <div className="info-label">Role</div>
                <div className="info-value">Sports Exco</div>
              </Col>

              <Col md={4}>
                <div className="info-label">Access Level</div>
                <div className="info-value">Administrator</div>
              </Col>

              <Col md={4}>
                <div className="info-label">Account Status</div>
                <div className="info-value text-success">Active</div>
              </Col>
            </Row>
          )}
        </div>
      </div>
    </div>
  );
}
