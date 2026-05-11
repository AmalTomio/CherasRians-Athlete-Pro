import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Auth from "../layouts/Auth";
import { successAlert, errorAlert, warningAlert } from "../utils/swal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      return warningAlert("Please enter your email.");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/forgot-password", { email });
      successAlert(res.data.message || "Password reset email sent successfully.");
      setEmail("");
    } catch (err) {
      errorAlert(err.response?.data?.message || "Failed to send reset email.");
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
          handleForgotPassword();
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
              <i className="bi bi-shield-lock text-white" style={{ fontSize: "2rem" }} />
            </div>
            <h2 className="fw-bold mb-2 text-dark">Password Recovery</h2>
            <p className="text-secondary mb-0">We’ll send a secure reset link to your email.</p>
          </div>
        </motion.div>

        <motion.div className="mb-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.45 }}>
          <label className="form-label fw-semibold text-dark">Registered Email Address</label>
          <input
            type="email"
            className="form-control rounded-4 custom-focus-ring"
            style={inputStyle}
            placeholder="e.g. athlete@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
            <><span className="spinner-border spinner-border-sm me-2" role="status" /> Sending Link...</>
          ) : ("Send Reset Link")}
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