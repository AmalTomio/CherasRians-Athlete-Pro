import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { successAlert, errorAlert } from "../utils/swal";
import Auth from "../layouts/Auth";

export default function Register() {
  const [role, setRole] = useState("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [nric, setNric] = useState("");
  const [year, setYear] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [staffId, setStaffId] = useState("");
  const [sport, setSport] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const toUpper = (val) => val.toUpperCase();

  const handleRegister = async () => {
    if (!firstName || !lastName) return errorAlert("Name is required.");
    if (!email) return errorAlert("Email is required.");

    if (role === "student") {
      if (!/^[0-9]{12}$/.test(nric)) {
        return errorAlert("NRIC must be exactly 12 digits.");
      }
      if (!year) return errorAlert("Year is required.");
      if (!classGroup) return errorAlert("Class Group is required.");
    }

    if (role !== "student" && !staffId) {
      return errorAlert("Staff ID is required.");
    }

    if (role === "coach" && !sport) {
      return errorAlert("Coach must select a sport.");
    }

    if (!password || !confirmPassword) {
      return errorAlert("Password fields are required.");
    }

    if (password !== confirmPassword) {
      return errorAlert("Passwords do not match.");
    }

    try {
      await api.post("/auth/register", {
        role,
        firstName: firstName.trim().toUpperCase(),
        lastName: lastName.trim().toUpperCase(),
        email,
        password,
        confirmPassword,
        nric: role === "student" ? nric : null,
        year: role === "student" ? year : null,
        classGroup: role === "student" ? classGroup : null,
        staffId: role !== "student" ? staffId : null,
        sport: role === "coach" ? sport : null,
      });

      successAlert("Registration successful!");
      navigate("/login");
    } catch (err) {
      errorAlert(err.response?.data?.message || "Registration failed.");
    }
  };

  const getClassOptions = () => {
    if (!year) return [];
    if (year === "1" || year === "2" || year === "3") {
      return ["DINAMIK", "EFEKTIF", "INOVATIF", "INTELEK", "PROAKTIF", "GAMELAN", "SAPELELE", "IMTIAZ"];
    }
    if (year === "4" || year === "5") {
      return ["ALPHA", "BETA", "DELTA", "COMMERCE", "KREATIF", "SINERGI", "ARTISTIK", "INOVATIF", "GOURMET"];
    }
    return [];
  };

  const inputStyle = {
    backgroundColor: "#f1f5f9",
    border: "1px solid transparent",
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    transition: "all 0.2s ease-in-out"
  };

  return (
    <Auth title="Join the Elite" subtitle="Create your profile to start tracking performance.">
      <motion.form 
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }} 
        className="pb-4"
      >
        <div className="mb-3">
          <label className="form-label fw-semibold text-dark small">Register As</label>
          <select
            className="form-select rounded-4 custom-focus-ring"
            style={inputStyle}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setNric(""); setStaffId(""); setSport(""); setYear(""); setClassGroup("");
            }}
          >
            <option value="student">Athlete (Student)</option>
            <option value="coach">Coach</option>
            <option value="exco">Sport Exco Teacher</option>
          </select>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold text-dark small">First Name</label>
            <input
              type="text"
              className="form-control rounded-4 custom-focus-ring"
              style={inputStyle}
              value={firstName}
              onChange={(e) => setFirstName(toUpper(e.target.value))}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold text-dark small">Last Name</label>
            <input
              type="text"
              className="form-control rounded-4 custom-focus-ring"
              style={inputStyle}
              value={lastName}
              onChange={(e) => setLastName(toUpper(e.target.value))}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-dark small">Email</label>
          <input
            type="email"
            className="form-control rounded-4 custom-focus-ring"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {role === "student" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark small">NRIC (12 digits)</label>
              <input
                type="text"
                maxLength={12}
                className="form-control rounded-4 custom-focus-ring"
                style={inputStyle}
                value={nric}
                onChange={(e) => setNric(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark small">Form</label>
                <select className="form-select rounded-4 custom-focus-ring" style={inputStyle} value={year} onChange={(e) => { setYear(e.target.value); setClassGroup(""); }}>
                  <option value="">Select Form</option>
                  <option value="1">Form 1</option>
                  <option value="2">Form 2</option>
                  <option value="3">Form 3</option>
                  <option value="4">Form 4</option>
                  <option value="5">Form 5</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark small">Class</label>
                <select className="form-select rounded-4 custom-focus-ring" style={inputStyle} value={classGroup} onChange={(e) => setClassGroup(e.target.value)} disabled={!year}>
                  <option value="">Select Class</option>
                  {getClassOptions().map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {(role === "coach" || role === "exco") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
            <label className="form-label fw-semibold text-dark small">Staff ID</label>
            <input type="text" className="form-control rounded-4 custom-focus-ring" style={inputStyle} value={staffId} onChange={(e) => setStaffId(e.target.value)} />
          </motion.div>
        )}

        {role === "coach" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
            <label className="form-label fw-semibold text-dark small">Sport Specialization</label>
            <select className="form-select rounded-4 custom-focus-ring" style={inputStyle} value={sport} onChange={(e) => setSport(e.target.value)}>
              <option value="">Select Sport</option>
              <option value="football">Football</option>
              <option value="volleyball">Volleyball</option>
              <option value="sepak_takraw">Sepak Takraw</option>
              <option value="badminton">Badminton</option>
            </select>
          </motion.div>
        )}

        <div className="row g-2 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold text-dark small">Password</label>
            <div className="input-group">
              <input type={showPassword ? "text" : "password"} className="form-control rounded-start-4 custom-focus-ring border-end-0" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="btn border-0 rounded-end-4 px-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }} onClick={() => setShowPassword(!showPassword)}>
                <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold text-dark small">Confirm</label>
            <div className="input-group">
              <input type={showConfirmPassword ? "text" : "password"} className="form-control rounded-start-4 custom-focus-ring border-end-0" style={inputStyle} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <button type="button" className="btn border-0 rounded-end-4 px-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
              </button>
            </div>
          </div>
          <div className="col-12 form-text text-muted" style={{ fontSize: "0.75rem" }}>
            Min 8 chars, uppercase, lowercase, number, and symbol.
          </div>
        </div>

        <motion.button 
          type="submit"
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          className="btn btn-lg w-100 rounded-4 text-white fw-bold shadow-sm" 
          style={{ background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)", border: "none" }}
        >
          Complete Registration
        </motion.button>

        <p className="text-center mt-4 fw-medium text-secondary">
          Already registered?
          <Link to="/login" className="fw-bold ms-2 text-decoration-none" style={{ color: "#0072ff" }}>
            Sign In
          </Link>
        </p>
      </motion.form>

      <style>{`
        .custom-focus-ring:focus {
          border-color: #00f2fe !important;
          box-shadow: 0 0 0 0.25rem rgba(0, 242, 254, 0.25) !important;
          background-color: #fff !important;
        }
      `}</style>
    </Auth>
  );
}