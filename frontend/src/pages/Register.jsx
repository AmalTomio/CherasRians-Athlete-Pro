import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";

import { successAlert, errorAlert } from "../utils/swal";

import { getClassOptionsForYear } from "../config/classGroups";
import { SPORT_META } from "../config/sportMeta";
import { formatSportName } from "../utils/format";

import Auth from "../layouts/Auth";

const FORM_OPTIONS = [1, 2, 3, 4, 5];

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [nric, setNric] = useState("");
  const [staffId, setStaffId] = useState("");

  const [sport, setSport] = useState("");

  const [year, setYear] = useState("");
  const [classGroup, setClassGroup] = useState("");

  const [loading, setLoading] = useState(false);

  const classOptions = useMemo(() => {
    return getClassOptionsForYear(year);
  }, [year]);

  const sportOptions = useMemo(() => {
    return Object.keys(SPORT_META);
  }, []);

  useEffect(() => {
    if (!classOptions.includes(classGroup)) {
      setClassGroup("");
    }
  }, [year, classGroup, classOptions]);

  useEffect(() => {
    if (role === "student") {
      setStaffId("");
      setSport("");
    }

    if (role === "coach") {
      setNric("");
      setYear("");
      setClassGroup("");
    }

    if (role === "exco") {
      setNric("");
      setYear("");
      setClassGroup("");
      setSport("");
    }
  }, [role]);

  const validateForm = () => {
    if (!firstName || !lastName || !email) {
      errorAlert("Please fill all required fields.");
      return false;
    }

    if (role === "student") {
      if (!/^[0-9]{12}$/.test(nric)) {
        errorAlert("NRIC must be exactly 12 digits.");
        return false;
      }

      if (!year) {
        errorAlert("Please select form.");
        return false;
      }

      if (!classGroup) {
        errorAlert("Please select class.");
        return false;
      }
    }

    if (role === "coach" || role === "exco") {
      if (!staffId.trim()) {
        errorAlert("Staff ID is required.");
        return false;
      }
    }

    if (role === "coach" && !sport) {
      errorAlert("Please select sport.");
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    role,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),

    nric: role === "student" ? nric : undefined,

    year: role === "student" ? year : undefined,

    classGroup: role === "student" ? classGroup : undefined,

    staffId: role === "coach" || role === "exco" ? staffId.trim() : undefined,

    sport: role === "coach" ? sport : undefined,
  });

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      await api.post("/auth/register", buildPayload());

      successAlert("Registration successful!");

      navigate("/login");
    } catch (err) {
      errorAlert(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Auth title="Create Account" subtitle="Fill the form to continue.">
      <div className="row g-2">
        {/* ROLE */}
        <div className="col-12">
          <label className="form-label">Register As</label>

          <select
            className="form-select custom-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>

            <option value="coach">Coach</option>

            <option value="exco">Sport Exco</option>
          </select>
        </div>

        {/* FIRST NAME */}
        <div className="col-6">
          <label className="form-label">First Name</label>

          <input
            type="text"
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        {/* LAST NAME */}
        <div className="col-6">
          <label className="form-label">Last Name</label>

          <input
            type="text"
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        {/* EMAIL */}
        <div className="col-12">
          <label className="form-label">Email</label>

          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* STUDENT */}
        {role === "student" && (
          <>
            <div className="col-12">
              <label className="form-label">NRIC (12 digits)</label>

              <input
                type="text"
                maxLength={12}
                className="form-control"
                value={nric}
                onChange={(e) => setNric(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="col-6">
              <label className="form-label">Form</label>

              <select
                className="form-select custom-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">Select</option>

                {FORM_OPTIONS.map((form) => (
                  <option key={form} value={form}>
                    Form {form}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6">
              <label className="form-label">Class</label>

              <select
                className="form-select custom-select"
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
              >
                <option value="">Select</option>

                {classOptions.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* STAFF ID */}
        {(role === "coach" || role === "exco") && (
          <div className="col-12">
            <label className="form-label">Staff ID</label>

            <input
              type="text"
              className="form-control"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
            />
          </div>
        )}

        {/* SPORT */}
        {role === "coach" && (
          <div className="col-12">
            <label className="form-label">Sport</label>

            <select
              className="form-select custom-select"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
            >
              <option value="">Select Sport</option>

              {sportOptions.map((sportKey) => (
                <option key={sportKey} value={sportKey}>
                  {formatSportName(sportKey)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* SUBMIT */}
        <div className="col-12 mt-2">
          <button
            className="btn-auth"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </div>

      <div className="auth-footer">
        Already have an account?
        <Link to="/login" className="ms-1">
          Login
        </Link>
      </div>
    </Auth>
  );
}
