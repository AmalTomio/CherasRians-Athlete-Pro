import React, { useEffect, useState } from "react";
import { Spinner, Row, Col, Card, Badge } from "react-bootstrap";
import {
  FiUser,
  FiAward,
  FiMail,
  FiPhone,
  FiActivity,
  FiCalendar,
  FiTrendingUp,
  FiCheckCircle,
  FiHeart,
} from "react-icons/fi";
import api from "../../api/axios";
import { formatSportName, formatLabel } from "../../utils/format";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/students/me/dashboard")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" style={{ color: "#114232" }} />
      </div>
    );
  }

  if (!data) return null;

  const { student, coach } = data;
  const firstName = student?.firstName || "Athlete";
  const fullName =
    `${student?.firstName || ""} ${student?.lastName || ""}`.trim();
  const coachName = coach
    ? `${coach.firstName || ""} ${coach.lastName || ""}`.trim()
    : "Not Assigned";

  return (
    <div className="container-fluid px-3 px-md-4 py-4 bg-light min-vh-100">
      <style>{`
        .dash-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          height: 100%;
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .dash-card-hoverable:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          cursor: pointer;
        }
        .welcome-banner {
          background: linear-gradient(135deg, #114232 0%, #1a634b 100%);
          border-radius: 16px;
          color: white;
          box-shadow: 0 8px 20px rgba(17, 66, 50, 0.15);
        }
        .dash-label {
          font-size: 0.8rem;
          color: #6c757d;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.25rem;
        }
        .dash-value {
          font-size: 1rem;
          color: #212529;
          font-weight: 600;
          word-wrap: break-word;
        }
        .dash-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .bg-green-soft { background-color: rgba(17, 66, 50, 0.1); color: #114232; }
        .bg-orange-soft { background-color: rgba(232, 123, 30, 0.1); color: #e87b1e; }
        .bg-blue-soft { background-color: rgba(13, 110, 253, 0.1); color: #0d6efd; }
        .bg-red-soft { background-color: rgba(220, 53, 69, 0.1); color: #dc3545; }
      `}</style>

      <div className="welcome-banner p-4 p-md-5 mb-4 position-relative overflow-hidden">
        <Row
          className="align-items-center position-relative"
          style={{ zIndex: 2 }}
        >
          <Col lg={8}>
            <Badge
              bg="light"
              text="dark"
              className="mb-3 px-3 py-2 rounded-pill fw-bold shadow-sm"
            >
              <FiActivity className="me-1 mb-1" style={{ color: "#e87b1e" }} />{" "}
              Active Season
            </Badge>
            <h2 className="fw-bolder mb-2 text-truncate" title={fullName}>
              Welcome back, {firstName}!
            </h2>
            <p className="mb-0 text-white-50 fs-6">
              Here is what's happening with your athletic profile today. Stay on
              top of your game.
            </p>
          </Col>
        </Row>
      </div>

      {/* ================= QUICK ACCESS WIDGETS ================= */}
      <h6 className="fw-bold text-dark mb-3">Quick Access</h6>
      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}>
          <Card
            className="dash-card dash-card-hoverable p-3"
            onClick={() => (window.location.href = "/student/schedule")}
          >
            <div className="d-flex align-items-center gap-3">
              <div className="dash-icon-box bg-blue-soft">
                <FiCalendar />
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">Schedule</h6>
                <small className="text-muted fw-medium">View fixtures</small>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={6} lg={3}>
          <Card
            className="dash-card dash-card-hoverable p-3"
            onClick={() => (window.location.href = "/student/performance")}
          >
            <div className="d-flex align-items-center gap-3">
              <div className="dash-icon-box bg-orange-soft">
                <FiTrendingUp />
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">Stats</h6>
                <small className="text-muted fw-medium">Track ratings</small>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={6} lg={3}>
          <Card
            className="dash-card dash-card-hoverable p-3"
            onClick={() => (window.location.href = "/student/medical")}
          >
            <div className="d-flex align-items-center gap-3">
              <div className="dash-icon-box bg-red-soft">
                <FiHeart />
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">Medical</h6>
                <small className="text-muted fw-medium">Report injuries</small>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ================= PROFILE & COACH GRID ================= */}
      <Row className="g-4">
        {/* ATHLETE PROFILE CARD */}
        <Col xs={12} lg={6}>
          <Card className="dash-card p-2 p-md-3">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div className="dash-icon-box bg-green-soft">
                  <FiUser />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark">Athlete Profile</h5>
                  <small className="text-muted">
                    Your registered system details
                  </small>
                </div>
              </div>

              <Row className="g-4">
                <Col xs={12} sm={6}>
                  <div className="dash-label">Full Name</div>
                  <div className="dash-value text-truncate" title={fullName}>
                    {fullName || "N/A"}
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="dash-label">Sport</div>
                  <div className="dash-value d-flex align-items-center gap-2">
                    <FiActivity style={{ color: "#e87b1e" }} />
                    {student?.sport
                      ? formatSportName(student.sport)
                      : "Unassigned"}
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="dash-label">Category</div>
                  <div className="dash-value">
                    {student?.category ? (
                      <Badge
                        bg="light"
                        text="dark"
                        className="border px-3 py-1 rounded-pill"
                      >
                        {formatLabel(student.category)}
                      </Badge>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="dash-label">Form & Class</div>
                  <div className="dash-value">
                    {student?.year && student?.classGroup
                      ? `Form ${student.year} | ${student.classGroup}`
                      : student?.classGroup || "N/A"}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* ASSIGNED COACH CARD
        <Col xs={12} lg={6}>
          <Card className="dash-card p-2 p-md-3">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div className="dash-icon-box bg-orange-soft">
                  <FiAward />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark">Assigned Coach</h5>
                  <small className="text-muted">Your primary team contact</small>
                </div>
              </div>

              {coach ? (
                <Row className="g-4">
                  <Col xs={12}>
                    <div className="dash-label">Coach Name</div>
                    <div className="dash-value fs-5">{coachName}</div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className="dash-label">Email Address</div>
                    <div className="dash-value d-flex align-items-center gap-2 text-truncate" title={coach.email}>
                      <FiMail className="text-secondary flex-shrink-0" /> 
                      <span className="text-truncate">{coach.email || "N/A"}</span>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className="dash-label">Contact Number</div>
                    <div className="dash-value d-flex align-items-center gap-2">
                      <FiPhone className="text-secondary flex-shrink-0" /> 
                      {coach.phone || "Not provided"}
                    </div>
                  </Col>
                </Row>
              ) : (
                <div className="text-center py-4 text-muted">
                  <FiUser size={40} className="mb-3 text-light" />
                  <p className="mb-0 fw-medium">No coach has been assigned to your profile yet.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col> */}
      </Row>
    </div>
  );
}
