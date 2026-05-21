import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { successAlert, errorAlert } from "../utils/swal";
import { getClassOptionsForYear } from "../config/classGroups";

import Auth from "../layouts/Auth";

export default function Register() {
  const [role, setRole] = useState("student");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [nric, setNric] = useState("");
  const [year, setYear] = useState("");
  const [classGroup, setClassGroup] = useState("");

  useEffect(() => {
    const validOptions = getClassOptionsForYear(year);

    if (!validOptions.includes(classGroup)) {
      setClassGroup("");
    }
  }, [year, classGroup]);

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", {
        role,
        firstName,
        lastName,
        email,
        nric,
        year,
        classGroup,
      });

      successAlert("Registration successful!");
      navigate("/login");
    } catch (err) {
      errorAlert(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <Auth title="Create Account" subtitle="Fill the form to continue.">
      <div className="row g-2">
        <div className="col-12">
          <label className="form-label">Register As</label>

          <select
            className="form-select custom-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>

            <option value="coach">Coach</option>

            <option value="exco">Sport Exco Teacher</option>
          </select>
        </div>

        <div className="col-6">
          <label className="form-label">First Name</label>

          <input
            type="text"
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="col-6">
          <label className="form-label">Last Name</label>

          <input
            type="text"
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="col-12">
          <label className="form-label">Email</label>

          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

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
          <label className="form-label ">Form</label>

          <select
            className="form-select custom-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Select</option>

            <option value="1">Form 1</option>

            <option value="2">Form 2</option>

            <option value="3">Form 3</option>

            <option value="4">Form 4</option>

            <option value="5">Form 5</option>
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

            {getClassOptionsForYear(year).map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 mt-2">
          <button className="btn-auth" onClick={handleRegister}>
            Register
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
