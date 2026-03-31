import React, { useEffect, useState, useRef } from "react";
import { Spinner, Alert, Button, Form } from "react-bootstrap";
import api from "../api/axios";
import Swal from "sweetalert2";
import {
  FiCamera,
  FiUser,
  FiMail,
  FiCalendar,
} from "react-icons/fi";

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
        bod: user.bod
          ? new Date(user.bod).toISOString().split("T")[0]
          : "",
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
      setError("Failed to load profile");
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
      return Swal.fire("Error", "Max 2MB only", "error");
    }

    const preview = URL.createObjectURL(file);

    setForm((prev) => ({ ...prev, profileUrl: preview }));
    setSelectedFile(file);
  };

  /* ================= SAVE ================= */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      /* Upload avatar */
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

      /* Update profile */
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

      Swal.fire("Success", "Profile updated", "success");
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

  /* ================= UI ================= */

  if (loading)
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner />
      </div>
    );

  const avatar =
    form.profileUrl ||
    `https://ui-avatars.com/api/?name=${form.firstName}+${form.lastName}`;

  return (
    <div className="container-fluid py-4">
      {error && <Alert variant="danger">{error}</Alert>}

      {/* ================= HEADER ================= */}
      <div className="glass-card p-4 mb-4 d-flex align-items-center gap-4">
        <div
          className="position-relative avatar-hover"
          style={{ width: 120, height: 120 }}
        >
          <img
            src={avatar}
            className="rounded-circle w-100 h-100 object-fit-cover"
          />

          <button
            className="btn btn-primary position-absolute bottom-0 end-0 rounded-circle"
            onClick={handleImageClick}
          >
            <FiCamera />
          </button>

          <input
            type="file"
            ref={fileRef}
            hidden
            onChange={handleImageChange}
          />
        </div>

        <div>
          <h4 className="fw-bold mb-1">
            {form.firstName} {form.lastName}
          </h4>
          <div className="text-muted">{role}</div>
        </div>
      </div>

      {/* ================= FORM ================= */}
      <Form onSubmit={handleSave} className="glass-card p-4">

        {/* PERSONAL */}
        <h5 className="mb-4 fw-bold">Personal Information</h5>

        <div className="row g-3">

          <Form.Group className="col-md-6 pulse-focus">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              value={form.firstName}
              onChange={(e) =>
                updateField("firstName", e.target.value)
              }
            />
          </Form.Group>

          <Form.Group className="col-md-6 pulse-focus">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              value={form.lastName}
              onChange={(e) =>
                updateField("lastName", e.target.value)
              }
            />
          </Form.Group>

          <Form.Group className="col-md-12 pulse-focus">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={form.email}
              onChange={(e) =>
                updateField("email", e.target.value)
              }
            />
          </Form.Group>

          <Form.Group className="col-md-6 pulse-focus">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              value={form.bod}
              onChange={(e) =>
                updateField("bod", e.target.value)
              }
            />
          </Form.Group>

          {/* ROLE BASED */}
          {role === "coach" && (
            <Form.Group className="col-md-6 pulse-focus">
              <Form.Label>Age</Form.Label>
              <Form.Control
                value={form.age}
                onChange={(e) =>
                  updateField("age", e.target.value)
                }
              />
            </Form.Group>
          )}

          {role === "student" && (
            <>
              <Form.Group className="col-md-6 pulse-focus">
                <Form.Label>Height</Form.Label>
                <Form.Control
                  value={form.height}
                  onChange={(e) =>
                    updateField("height", e.target.value)
                  }
                />
              </Form.Group>

              <Form.Group className="col-md-6 pulse-focus">
                <Form.Label>Weight</Form.Label>
                <Form.Control
                  value={form.weight}
                  onChange={(e) =>
                    updateField("weight", e.target.value)
                  }
                />
              </Form.Group>
            </>
          )}
        </div>

        {/* SYSTEM INFO */}
        <h5 className="mt-5 mb-3 fw-bold">System Info</h5>

        <div className="row g-3">
          <Form.Group className="col-md-6">
            <Form.Label>Sport</Form.Label>
            <Form.Control value={form.sport} disabled />
          </Form.Group>

          <Form.Group className="col-md-6">
            <Form.Label>Category</Form.Label>
            <Form.Control value={form.category} disabled />
          </Form.Group>
        </div>

        {/* SAVE */}
        <div className="text-end mt-4">
          <Button type="submit" disabled={saving} className="hover-lift">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Form>
    </div>
  );
}