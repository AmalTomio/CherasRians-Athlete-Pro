import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

    try {
      await api.post("/auth/register", {
        role,
        firstName: firstName.trim().toUpperCase(),
lastName: lastName.trim().toUpperCase(),
        email,
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
      return [
        "DINAMIK",
        "EFEKTIF",
        "INOVATIF",
        "INTELEK",
        "PROAKTIF",
        "GAMELAN",
        "SAPELELE",
        "IMTIAZ",
      ];
    }

    if (year === "4" || year === "5") {
      return [
        "ALPHA",
        "BETA",
        "DELTA",
        "COMMERCE",
        "KREATIF",
        "SINERGI",
        "ARTISTIK",
        "INOVATIF",
        "GOURMET",
      ];
    }

    return [];
  };

  return (
    <Auth title="Create Account" subtitle="Fill the form to continue.">
      <div className="mb-3">
        <label className="form-label">Register As</label>
        <select
          className="form-select"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setNric("");
            setStaffId("");
            setSport("");
            setYear("");
            setClassGroup("");
          }}
        >
          <option value="student">Student</option>
          <option value="coach">Coach</option>
          <option value="exco">Sport Exco Teacher</option>
        </select>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            value={firstName}
  onChange={(e) => setFirstName(toUpper(e.target.value))}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            value={lastName}
  onChange={(e) => setLastName(toUpper(e.target.value))}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {role === "student" && (
        <>
          <div className="mb-3">
            <label className="form-label">NRIC (12 digits)</label>
            <input
              type="text"
              maxLength={12}
              className="form-control"
              value={nric}
              onChange={(e) => setNric(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Form (1–5)</label>
            <select
              className="form-select"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setClassGroup(""); 
              }}
            >
              <option value="">Select Form</option>
              <option value="1">Form 1</option>
              <option value="2">Form 2</option>
              <option value="3">Form 3</option>
              <option value="4">Form 4</option>
              <option value="5">Form 5</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Class</label>
            <select
              className="form-select"
              value={classGroup}
              onChange={(e) => setClassGroup(e.target.value)}
              disabled={!year} 
            >
              <option value="">Select Class</option>

              {getClassOptions().map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {(role === "coach" || role === "exco") && (
        <div className="mb-3">
          <label className="form-label">Staff ID</label>
          <input
            type="text"
            className="form-control"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          />
        </div>
      )}

      {role === "coach" && (
        <div className="mb-3">
          <label className="form-label">Sport</label>
          <select
            className="form-select"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
          >
            <option value="">Select Sport</option>
            <option value="football">Football</option>
            <option value="volleyball">Volleyball</option>
            <option value="sepak_takraw">Sepak Takraw</option>
            <option value="badminton">Badminton</option>
          </select>
        </div>
      )}

      <button className="btn btn-primary w-100 mt-2" onClick={handleRegister}>
        Register
      </button>

      <p className="text-center mt-3 mb-0">
        Already have an account?
        <Link to="/login" className="text-primary fw-bold ms-1">
          Login
        </Link>
      </p>
    </Auth>
  );
}
