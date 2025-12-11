import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { successAlert, errorAlert, warningAlert } from "../utils/swal";
import { generateFakeUser } from "../utils/fakeData";

import Auth from "../layouts/Auth";

export default function Register() {
  const [role, setRole] = useState("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Student fields
  const [nric, setNric] = useState("");
  const [year, setYear] = useState("");
  const [classGroup, setClassGroup] = useState("");

  // Staff fields
  const [staffId, setStaffId] = useState("");

  // Coach fields
  const [sport, setSport] = useState("");

  const navigate = useNavigate();

  // =========================
  // FAKE DATA (DEV ONLY)
  // =========================
  const fillFakeData = () => {
    const fakeUser = generateFakeUser(role);

    setFirstName(fakeUser.firstName);
    setLastName(fakeUser.lastName);
    setEmail(fakeUser.email);

    if (role === "student") {
      setNric(fakeUser.nric);
      setYear(fakeUser.year || "");
      setClassGroup(fakeUser.classGroup || "");
    }

    if (role !== "student") {
      setStaffId(fakeUser.staffId);
    }

    if (role === "coach") {
      setSport(fakeUser.sport);
    }
  };

  // =========================
  // REGISTER HANDLER
  // =========================
  const handleRegister = async () => {
    if (!firstName || !lastName) return errorAlert("Name is required.");
    if (!email) return errorAlert("Email is required.");

    // Student validation
    if (role === "student") {
      if (!/^[0-9]{12}$/.test(nric)) {
        return errorAlert("NRIC must be exactly 12 digits.");
      }
      if (!year) return errorAlert("Year is required.");
      if (!classGroup) return errorAlert("Class Group is required.");
    }

    // Staff validation
    if (role !== "student" && !staffId) {
      return errorAlert("Staff ID is required.");
    }

    // Coach validation
    if (role === "coach" && !sport) {
      return errorAlert("Coach must select a sport.");
    }

    try {
      await api.post("/auth/register", {
        role,
        firstName,
        lastName,
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
      {/* Fake Data Button */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm w-100"
            onClick={fillFakeData}
          >
            🎲 Fill with Fake Data (Testing)
          </button>
        </div>
      )}

      {/* ROLE */}
      <div className="mb-4">
        <label className="form-label">Register As</label>
        <select
          className="form-select form-select-lg"
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

      {/* FIRST + LAST NAME */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-control form-control-lg"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control form-control-lg"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      {/* EMAIL */}
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control form-control-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* STUDENT FIELDS */}
      {role === "student" && (
        <>
          {/* NRIC */}
          <div className="mb-3">
            <label className="form-label">NRIC (12 digits)</label>
            <input
              type="text"
              maxLength={12}
              className="form-control form-control-lg"
              value={nric}
              onChange={(e) => setNric(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Year (1–5)</label>
            <select
              className="form-select form-select-lg"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setClassGroup(""); // reset class when year changes
              }}
            >
              <option value="">Select Year</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
              <option value="5">Year 5</option>
            </select>
          </div>

          {/* CLASS */}
          <div className="mb-3">
            <label className="form-label">Class</label>
            <select
              className="form-select form-select-lg"
              value={classGroup}
              onChange={(e) => setClassGroup(e.target.value)}
              disabled={!year} // disable until year selected
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

      {/* STAFF ID FIELDS */}
      {(role === "coach" || role === "exco") && (
        <div className="mb-3">
          <label className="form-label">Staff ID</label>
          <input
            type="text"
            className="form-control form-control-lg"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          />
        </div>
      )}

      {/* COACH SPORT */}
      {role === "coach" && (
        <div className="mb-3">
          <label className="form-label">Sport</label>
          <select
            className="form-select form-select-lg"
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

      {/* SUBMIT */}
      <button className="btn btn-primary btn-lg w-100" onClick={handleRegister}>
        Register
      </button>

      <p className="text-center mt-3">
        Already have an account?
        <Link to="/login" className="text-primary fw-bold ms-1">
          Login
        </Link>
      </p>
    </Auth>
  );
}
