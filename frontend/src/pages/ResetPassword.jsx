import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Auth from "../layouts/Auth";
import { successAlert, errorAlert, warningAlert } from "../utils/swal";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      return warningAlert("Please fill all password fields.");
    }
    if (password !== confirmPassword) {
      return warningAlert("Passwords do not match.");
    }

    try {
      setLoading(true);
      const res = await api.post(`/auth/reset-password/${token}`, { password, confirmPassword });
      successAlert(res.data.message || "Password reset successful.");
      navigate("/login");
    } catch (err) {
      errorAlert(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "#f1f5f9",
    border: "1px solid transparent",
    padding: "0.85rem 1.25rem",
    fontSize: "1rem",
    transition: "all 0.2s ease-in-out"
  };

  return (
    <Auth title="" subtitle="">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleResetPassword();
        }}
        className="w-100"
      >
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="text-center mb-4 mt-n4">
            <div
              className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: 80, height: 80,
                background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
                boxShadow: "0 10px 30px rgba(0,242,254,0.35)",
              }}
            >
              <i className="bi bi-key text-white" style={{ fontSize: "2.25rem" }} />
            </div>
            <h2 className="fw-bold mb-2 text-dark">Set New Password</h2>
            <p className="text-secondary mb-0">Create a new, secure password to regain access.</p>
          </div>
        </motion.div>

        <motion.div className="mb-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="form-label fw-semibold text-dark">New Password</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control rounded-start-4 custom-focus-ring border-end-0"
              style={inputStyle}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn border-0 rounded-end-4 px-3 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={showPassword ? "bi bi-eye-slash fs-5" : "bi bi-eye fs-5"}></i>
            </button>
          </div>
        </motion.div>

        <motion.div className="mb-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <label className="form-label fw-semibold text-dark">Confirm Password</label>
          <div className="input-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control rounded-start-4 custom-focus-ring border-end-0"
              style={inputStyle}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn border-0 rounded-end-4 px-3 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <i className={showConfirmPassword ? "bi bi-eye-slash fs-5" : "bi bi-eye fs-5"}></i>
            </button>
          </div>
          <div className="form-text mt-2" style={{ fontSize: "0.8rem" }}>
            Minimum 8 characters with uppercase, lowercase, number, and symbol.
          </div>
        </motion.div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-lg w-100 rounded-4 text-white fw-bold shadow-sm"
          style={{ background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)", border: "none" }}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status" /> Resetting...</>
          ) : ("Reset Password")}
        </motion.button>
      </form>

      <motion.div className="text-center mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: "#64748b" }}>
          <i className="bi bi-arrow-left me-2"></i>Back to Sign In
        </Link>
      </motion.div>

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