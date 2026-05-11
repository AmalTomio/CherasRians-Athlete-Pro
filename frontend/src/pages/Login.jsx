import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { warningAlert, errorAlert, successAlert } from "../utils/swal";
import Auth from "../layouts/Auth";
import { initSocket } from "../socket";

export default function Login() {
  const [role, setRole] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!role) return warningAlert("Please select your role");

    if (role === "student" && identifier.length !== 12) {
      return warningAlert("NRIC must be exactly 12 digits");
    }

    if (!identifier.trim()) {
      return warningAlert(
        role === "student" ? "Please enter NRIC" : "Please enter Staff ID",
      );
    }
    if (!password.trim()) {
      return warningAlert("Please enter password");
    }
    try {
      const res = await api.post("/auth/login", {
        role,
        identifier,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      initSocket(res.data.token);

      successAlert("Logging in...");
      navigate("/dashboard");
    } catch (err) {
      errorAlert(err.response?.data?.message || "Login failed");
    }
  };

  const inputStyle = {
    backgroundColor: "#f1f5f9",
    border: "1px solid transparent",
    padding: "0.85rem 1.25rem",
    fontSize: "1rem",
    boxShadow: "none",
    transition: "all 0.2s ease-in-out"
  };

  return (
    <Auth title="Welcome Back" subtitle="Sign in to your sports dashboard.">
      <motion.form 
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4">
          <label className="form-label fw-semibold text-dark">Access Level</label>
          <select
            className="form-select rounded-4 custom-focus-ring"
            style={inputStyle}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setIdentifier(""); 
            }}
          >
            <option value="">Choose Role</option>
            <option value="student">Athlete (Student)</option>
            <option value="coach">Coach</option>
            <option value="exco">Sports Exco</option>
          </select>
        </div>

        {role && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4">
            <label className="form-label fw-semibold text-dark">
              {role === "student" ? "NRIC Number" : "Staff ID"}
            </label>
            <input
              type="text"
              className="form-control rounded-4 custom-focus-ring"
              style={inputStyle}
              placeholder={role === "student" ? "Enter 12-digit NRIC" : "Enter Staff ID"}
              value={identifier}
              maxLength={role === "student" ? 12 : 50}
              onChange={(e) => {
                let value = e.target.value;
                if (role === "student") value = value.replace(/\D/g, "");
                setIdentifier(value);
              }}
            />
          </motion.div>
        )}

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label fw-semibold text-dark mb-0">Password</label>
            <Link to="/forgot-password" className="text-decoration-none small fw-semibold" style={{ color: "#0072ff" }}>
              Forgot Password?
            </Link>
          </div>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control rounded-start-4 custom-focus-ring border-end-0"
              style={inputStyle}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="btn border-0 rounded-end-4 px-3 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={showPassword ? "bi bi-eye-slash fs-5" : "bi bi-eye fs-5"}></i>
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-lg w-100 rounded-4 text-white fw-bold shadow-sm mt-2"
          style={{ 
            background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
            border: "none"
          }}
        >
          Sign In
        </motion.button>

        <p className="text-center mt-4 fw-medium text-secondary">
          New to the platform?
          <Link to="/register" className="fw-bold ms-2 text-decoration-none" style={{ color: "#0072ff" }}>
            Create an account
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