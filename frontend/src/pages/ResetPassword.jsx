import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import api from "../api/axios";
import Auth from "../layouts/Auth";

import {
  successAlert,
  errorAlert,
  warningAlert,
} from "../utils/swal";

export default function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      return warningAlert(
        "Please fill all password fields."
      );
    }

    if (password !== confirmPassword) {
      return warningAlert("Passwords do not match.");
    }

    try {
      setLoading(true);

      const res = await api.post(
        `/auth/reset-password/${token}`,
        {
          password,
          confirmPassword,
        }
      );

      successAlert(
        res.data.message ||
          "Password reset successful."
      );

      navigate("/login");
    } catch (err) {
      errorAlert(
        err.response?.data?.message ||
          "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Auth
      title="Reset Password"
      subtitle="Create a new secure password for your account."
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
              className="bi bi-shield-lock text-white"
              style={{ fontSize: "1.75rem" }}
            />
          </div>

          <h5 className="fw-bold mb-2">
            Secure Password Reset
          </h5>

          <p className="text-muted small mb-0">
            Your new password should be strong and unique.
          </p>
        </div>
      </motion.div>

      {/* PASSWORD */}
      <motion.div
        className="mb-3"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="form-label fw-semibold">
          New Password
        </label>

        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control form-control-lg rounded-start-4"
            placeholder="Enter new password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            type="button"
            className="btn btn-outline-secondary rounded-end-4"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </motion.div>

      {/* CONFIRM PASSWORD */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="form-label fw-semibold">
          Confirm Password
        </label>

        <div className="input-group">
          <input
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            className="form-control form-control-lg rounded-start-4"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
          />

          <button
            type="button"
            className="btn btn-outline-secondary rounded-end-4"
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="form-text mt-2">
          Minimum 8 characters with uppercase,
          lowercase, number, and symbol.
        </div>
      </motion.div>

      {/* BUTTON */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="btn btn-primary btn-lg w-100 rounded-4 fw-semibold"
        onClick={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Resetting Password...
          </>
        ) : (
          "Reset Password"
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