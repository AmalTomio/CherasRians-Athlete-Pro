import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  return (
    <Auth title="Log in" subtitle="Welcome back! Please enter your details.">
      <div className="mb-3">
        <label className="form-label">Select Role</label>
        <select
          className="form-select"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setIdentifier(""); // reset field when role changes
          }}
        >
          <option value="">Choose Role</option>
          <option value="student">Student</option>
          <option value="coach">Coach</option>
          <option value="exco">Exco</option>
        </select>
      </div>

      {/* NRIC / STAFF ID INPUT */}
      {role && (
        <div className="mb-3">
          <label className="form-label">
            {role === "student" ? "NRIC (12 digits)" : "Staff ID"}
          </label>
          <input
            type="text"
            className="form-control"
            placeholder={
              role === "student" ? "Enter NRIC (12 digits)" : "Enter Staff ID"
            }
            value={identifier}
            maxLength={role === "student" ? 12 : 50}
            onChange={(e) => {
              let value = e.target.value;
              if (role === "student") value = value.replace(/\D/g, "");
              setIdentifier(value);
            }}
          />
        </div>
      )}
      <div className="mb-3">
        <label className="form-label">Password</label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <div className="d-flex justify-content-end mb-3">
        <Link to="/forgot-password" className="text-decoration-none">
          Forgot Password?
        </Link>
      </div>
      <button
        className="btn btn-primary btn-lg w-100 mt-2"
        onClick={handleLogin}
      >
        Sign in
      </button>

      

      <p className="text-center mt-3">
        Don’t have an account?
        <Link to="/register" className="text-primary fw-bold ms-1">
          Register
        </Link>
      </p>
    </Auth>
  );
}
