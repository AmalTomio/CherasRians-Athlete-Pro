import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import api from "../api/axios";
import Auth from "../layouts/Auth";

import {
  successAlert,
  errorAlert,
  warningAlert,
} from "../utils/swal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      return warningAlert("Please enter your email.");
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/forgot-password", {
        email,
      });

      successAlert(
        res.data.message ||
          "Password reset email sent successfully."
      );

      setEmail("");
    } catch (err) {
      errorAlert(
        err.response?.data?.message ||
          "Failed to send reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Auth
      title="Forgot Password"
      subtitle="Enter your registered email to receive a reset link."
    >
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="text-center mb-4">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 72,
              height: 72,
              background:
                "linear-gradient(135deg, #2563eb, #4f46e5)",
              boxShadow:
                "0 10px 30px rgba(37,99,235,0.35)",
            }}
          >
            <i
              className="bi bi-envelope-paper text-white"
              style={{ fontSize: "1.75rem" }}
            />
          </div>

          <h5 className="fw-bold mb-2">
            Password Recovery
          </h5>

          <p className="text-muted small mb-0">
            We’ll send you a secure password reset link.
          </p>
        </div>
      </motion.div>

      {/* EMAIL */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <label className="form-label fw-semibold">
          Email Address
        </label>

        <input
          type="email"
          className="form-control form-control-lg rounded-4"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </motion.div>

      {/* BUTTON */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="btn btn-primary btn-lg w-100 rounded-4 fw-semibold"
        onClick={handleForgotPassword}
        disabled={loading}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Sending Reset Link...
          </>
        ) : (
          "Send Reset Link"
        )}
      </motion.button>

      {/* FOOTER */}
      <motion.div
        className="text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <Link
          to="/login"
          className="text-decoration-none fw-semibold"
        >
          ← Back to Login
        </Link>
      </motion.div>
    </Auth>
  );
}