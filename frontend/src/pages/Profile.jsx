import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import api from "../api/axios";
import Swal from "sweetalert2";

export default function Profile() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("student"); 

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    bod: "",
    profileUrl: "", // For default profile picture request
    
    // Fixed Fields (Read-only)
    gender: "",
    formClass: "",
    height: "",
    weight: "",
    sport: "",
    category: "",
    position: ""
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.role) setRole(storedUser.role);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      const user = res.data.data || res.data.user || res.data;
      
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        age: user.age || "",
        bod: user.bod ? new Date(user.bod).toISOString().split('T')[0] : "",
        profileUrl: user.profileUrl || "",
        
        // Fixed read-only data mapping
        gender: user.gender || "-",
        formClass: user.form_class || "-",
        height: user.height || "-",
        weight: user.weight || "-",
        sport: user.sport || "-",
        category: user.category || "-",
        position: user.position || "-"
      });
    } catch (err) {
      setError("Failed to load profile. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Only dispatch the strictly permitted editable items
    const safePayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    };

    try {
      await api.put("/users/me", safePayload);
      Swal.fire("Success", "Profile details updated successfully.", "success");
      
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.firstName = formData.firstName;
        user.lastName = formData.lastName;
        user.email = formData.email;
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container-fluid py-5 d-flex align-items-center justify-content-center min-vh-100">
        <Spinner animation="grow" variant="primary" />
      </div>
    );
  }

  // Safe fallback placeholder for avatar
  const avatarSrc = formData.profileUrl || "https://ui-avatars.com/api/?name=User+Profile&background=2563eb&color=fff&size=256";

  return (
    <div className="container-fluid py-5" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div className="mb-4 px-md-3">
        <h2 className="mb-1 text-dark fw-bold">My Profile</h2>
        <p className="text-secondary">View your fixed configuration and update your basic details.</p>
      </div>

      <div className="row g-4 max-w-4xl mx-auto px-md-3">
        {/* Simple Avatar Sidebar */}
        <div className="col-12 col-lg-4 text-center">
           <div className="sticky-top" style={{ top: "100px" }}>
             
             <div className="d-inline-block rounded-circle overflow-hidden border border-4 border-white shadow-sm mb-3" style={{ width: "160px", height: "160px" }}>
               <img src={avatarSrc} alt="Profile" className="w-100 h-100 object-fit-cover" onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=User+Profile&background=2563eb&color=fff&size=256"} />
             </div>
             
             <h3 className="fw-bold text-dark mb-1">{formData.firstName} {formData.lastName}</h3>
             <span className="badge bg-primary px-3 py-2 rounded-pill fs-6 text-uppercase tracking-wider shadow-sm">
               {role} Account
             </span>
             
             {/* Read-only Quick View */}
             <div className="mt-4 p-3 bg-white rounded-4 shadow-sm text-start border border-light">
                <p className="text-muted small mb-2"><i className="bi bi-info-circle me-2"></i>Sport Assignment</p>
                <div className="fw-bold text-primary">{formData.sport && formData.sport !== "-" ? formData.sport.replace("_", " ").toUpperCase() : "UNASSIGNED"}</div>
                {formData.category && formData.category !== "-" && <div className="text-secondary mt-1">{formData.category}</div>}
             </div>
           </div>
        </div>

        {/* Form Column */}
        <div className="col-12 col-lg-8">
           {error && <Alert variant="danger">{error}</Alert>}
           
           <Form onSubmit={handleSave} className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light">
             
             {/* 1. EDITABLE FIELDS */}
             <div className="mb-5">
               <h5 className="fw-bold text-dark border-bottom pb-2 mb-4">Editable Information</h5>
               <div className="row g-3">
                 <Form.Group className="col-md-6">
                   <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">First Name</Form.Label>
                   <Form.Control type="text" value={formData.firstName} onChange={e => handleFieldChange("firstName", e.target.value)} className="bg-light border-0 shadow-none form-control-lg" required />
                 </Form.Group>
                 <Form.Group className="col-md-6">
                   <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Last Name</Form.Label>
                   <Form.Control type="text" value={formData.lastName} onChange={e => handleFieldChange("lastName", e.target.value)} className="bg-light border-0 shadow-none form-control-lg" required />
                 </Form.Group>
                 <Form.Group className="col-md-12">
                   <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Email</Form.Label>
                   <Form.Control type="email" value={formData.email} onChange={e => handleFieldChange("email", e.target.value)} className="bg-light border-0 shadow-none form-control-lg" required />
                 </Form.Group>
                 <Form.Group className="col-md-6">
                   <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Age</Form.Label>
                   <Form.Control type="number" value={formData.age} onChange={e => handleFieldChange("age", e.target.value)} className="bg-light border-0 shadow-none form-control-lg" />
                 </Form.Group>
                 <Form.Group className="col-md-6">
                   <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Date of Birth</Form.Label>
                   <Form.Control type="date" value={formData.bod} onChange={e => handleFieldChange("bod", e.target.value)} className="bg-light border-0 shadow-none form-control-lg" />
                 </Form.Group>
                 <Form.Group className="col-md-12">
                   <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Profile Picture URL</Form.Label>
                   <Form.Control type="text" placeholder="https://..." value={formData.profileUrl} onChange={e => handleFieldChange("profileUrl", e.target.value)} className="bg-light border-0 shadow-none form-control-lg" />
                 </Form.Group>
               </div>
             </div>

             {/* 2. FIXED FIELDS */}
             <div>
               <h5 className="fw-bold text-dark border-bottom pb-2 mb-4">Fixed Configuration</h5>
               <div className="row g-3">
                 <Form.Group className="col-md-4">
                   <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Sport</Form.Label>
                   <Form.Control readOnly value={formData.sport?.replace("_", " ").toUpperCase() || "-"} className="border-0 shadow-none text-muted form-control-lg" />
                 </Form.Group>
                 
                 {(role === "student" || role === "coach") && (
                   <>
                     <Form.Group className="col-md-4">
                       <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Category</Form.Label>
                       <Form.Control readOnly value={formData.category} className="border-0 shadow-none text-muted form-control-lg" />
                     </Form.Group>
                     <Form.Group className="col-md-4">
                       <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Position</Form.Label>
                       <Form.Control readOnly value={formData.position} className="border-0 shadow-none text-muted form-control-lg" />
                     </Form.Group>
                   </>
                 )}
                 
                 {role === "student" && (
                   <>
                     <Form.Group className="col-md-4">
                       <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Form & Class</Form.Label>
                       <Form.Control readOnly value={formData.formClass} className="border-0 shadow-none text-muted form-control-lg" />
                     </Form.Group>
                     <Form.Group className="col-md-4">
                       <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Height (cm)</Form.Label>
                       <Form.Control readOnly value={formData.height} className="border-0 shadow-none text-muted form-control-lg" />
                     </Form.Group>
                     <Form.Group className="col-md-4">
                       <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Weight (kg)</Form.Label>
                       <Form.Control readOnly value={formData.weight} className="border-0 shadow-none text-muted form-control-lg" />
                     </Form.Group>
                   </>
                 )}

                 <Form.Group className="col-md-4">
                   <Form.Label className="small fw-medium text-secondary text-uppercase tracking-wider">Gender</Form.Label>
                   <Form.Control readOnly value={formData.gender.toUpperCase()} className="border-0 shadow-none text-muted form-control-lg" />
                 </Form.Group>
               </div>
             </div>
             
             <div className="mt-5 text-end">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={saving} 
                  className="px-5 py-2 fw-bold shadow-sm"
                >
                  {saving ? (
                    <><Spinner as="span" animation="border" size="sm" className="me-2" /> Saving...</>
                  ) : "Save Basic Details"}
                </Button>
             </div>
           </Form>
        </div>
      </div>
    </div>
  );
}
