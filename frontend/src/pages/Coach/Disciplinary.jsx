import React, { useEffect, useState, useMemo } from "react";
import { Form, Button, Modal, Badge, Spinner } from "react-bootstrap";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";
import {
  FiShield,
  FiPlus,
  FiEdit3,
  FiUser,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiFileText,
} from "react-icons/fi";
import { SPORT_META } from "../../config/sportMeta";

// Centralized Components
import FiltersCard from "../../components/FiltersCard";
import StatCard from "../../components/StatCard";
import Table from "../../components/Table";

export default function Disciplinary() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const sport = user?.sport || "football";

  // Data State
  const [cases, setCases] = useState([]);
  const [players, setPlayers] = useState([]);

  // UI/Loading State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Restricted Filter State (Player Name Only)
  const [search, setSearch] = useState("");

  // Modals State
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const initialForm = {
    playerId: "",
    category: user?.category || "U-15", // Moved category selection into the form
    type: "Misconduct",
    reason: "",
    description: "",
    severity: "low",
  };
  const [form, setForm] = useState(initialForm);

  /* ================= LOAD DATA ================= */
  // Fetch all cases for the coach
  useEffect(() => {
    fetchCases();
  }, [sport]);

  // Fetch players dynamically based on the category selected in the Create Form
  useEffect(() => {
    fetchPlayers(form.category);
  }, [form.category, sport]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.get("/disciplinary/coach");
      setCases(res.data.data);
    } catch {
      errorAlert("Failed to load disciplinary records.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async (selectedCategory) => {
    try {
      const res = await api.get("/coach/players/all");

      const filteredPlayers = (res.data.students || []).filter(
        (player) => player.category === selectedCategory,
      );

      setPlayers(filteredPlayers);
    } catch (err) {
      console.error(err);
      setPlayers([]);
    }
  };

  const handleCreate = async () => {
    if (!form.playerId || !form.reason.trim() || !form.description.trim()) {
      return errorAlert("Please complete all required fields.");
    }

    setSubmitting(true);
    try {
      await api.post("/disciplinary", { ...form, sport });
      successAlert("Disciplinary record filed successfully.");
      setForm(initialForm);
      setShowCreate(false);
      fetchCases();
    } catch (err) {
      errorAlert(err.response?.data?.message || "Failed to create case.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing.reason.trim() || !editing.description.trim()) {
      return errorAlert("Fields cannot be empty.");
    }

    setSubmitting(true);
    try {
      await api.put(`/disciplinary/${editing._id}`, editing);
      successAlert("Case updated successfully.");
      setEditing(null);
      fetchCases();
    } catch (err) {
      errorAlert(err.response?.data?.message || "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= FILTERS & COMPUTATIONS ================= */
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // ONLY filter by Player Name
      if (search) {
        const query = search.toLowerCase();
        const playerName =
          `${c.playerId?.firstName || ""} ${c.playerId?.lastName || ""}`.toLowerCase();
        if (!playerName.includes(query)) return false;
      }
      return true;
    });
  }, [cases, search]);

  // KPIs derived from all cases
  const activeCases = cases.filter((c) => c.status === "open").length;
  const resolvedCases = cases.filter((c) => c.status === "resolved").length;
  const highSeverity = cases.filter(
    (c) => c.status === "open" && c.severity === "high",
  ).length;

  /* ================= TABLE CONFIGURATION ================= */
  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return (
          <Badge bg="danger" className="px-3 py-2 rounded-pill shadow-sm">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge
            bg="warning"
            text="dark"
            className="px-3 py-2 rounded-pill shadow-sm"
          >
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge bg="info" className="px-3 py-2 rounded-pill shadow-sm">
            Low
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary" className="px-3 py-2 rounded-pill">
            {severity}
          </Badge>
        );
    }
  };

  const getStatusBadge = (statusVal) => {
    return statusVal?.toLowerCase() === "resolved" ? (
      <Badge
        bg="success"
        className="px-3 py-2 rounded-pill border border-success bg-opacity-75"
      >
        Resolved
      </Badge>
    ) : (
      <Badge
        bg="light"
        text="dark"
        className="px-3 py-2 rounded-pill border shadow-sm text-secondary"
      >
        Open
      </Badge>
    );
  };

  const columns = [
    {
      key: "athlete",
      label: "Athlete",
      accessor: (row) => (
        <div className="d-flex align-items-center gap-3 py-2">
          <div
            className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center fw-bold"
            style={{ width: "42px", height: "42px" }}
          >
            <FiUser size={18} />
          </div>
          <div>
            <span
              className="fw-bolder text-dark d-block"
              style={{ fontSize: "0.95rem" }}
            >
              {row.playerId?.firstName} {row.playerId?.lastName}
            </span>
            <span className="small text-muted fw-medium">
              {row.category} Squad • ID:{" "}
              {row.playerId?._id.slice(-5).toUpperCase()}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "details",
      label: "Incident Details",
      accessor: (row) => (
        <div className="d-flex flex-column py-2">
          <span className="fw-bold text-dark mb-1">
            {row.type || "General Conduct"}
          </span>
          <span
            className="text-muted small text-truncate"
            style={{ maxWidth: "250px" }}
            title={row.reason}
          >
            {row.reason}
          </span>
        </div>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      accessor: (row) => getSeverityBadge(row.severity),
    },
    {
      key: "status",
      label: "Status",
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      key: "actions",
      label: "Actions",
      accessor: (row) => (
        <Button
          variant="light"
          size="sm"
          className="rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 text-primary border shadow-sm hover-lift"
          onClick={() => setEditing(row)}
        >
          <FiEdit3 /> Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="px-4 py-4">
      {/* ================= HERO BANNER ================= */}
      <div
        className="card border-0 rounded-4 mb-4 overflow-hidden shadow-sm position-relative"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        }}
      >
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(255,255,255,0.02)",
            top: "-100px",
            right: "-50px",
          }}
        ></div>
        <div className="card-body p-4 position-relative z-1 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="text-white">
            <h3 className="fw-bolder mb-1 d-flex align-items-center gap-2">
              Disciplinary Board
            </h3>
            <p className="mb-0 opacity-75 small">
              Monitor and manage player conduct and attendance infractions.
            </p>
          </div>
          <Button
            variant="primary"
            className="fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-lg hover-lift border-0"
            style={{ backgroundColor: "#3b82f6" }}
            onClick={() => setShowCreate(true)}
          >
            <FiPlus size={18} /> File New Report
          </Button>
        </div>
      </div>

      {/* ================= KPI METRICS ROW ================= */}
      <div className="row g-4 mb-4">
        <StatCard
          title="Active Cases"
          value={activeCases}
          icon={<FiClock size={22} />}
          iconBg="#eff6ff"
          iconColor="#3b82f6"
        />
        <StatCard
          title="Resolved Cases"
          value={resolvedCases}
          icon={<FiCheckCircle size={22} />}
          iconBg="#ecfdf5"
          iconColor="#10b981"
        />
        <StatCard
          title="Critical Actions"
          value={highSeverity}
          icon={<FiAlertCircle size={22} />}
          iconBg="#fef2f2"
          iconColor="#ef4444"
        />
      </div>

      {/* ================= FILTERS (NAME ONLY) ================= */}
      <FiltersCard
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search athlete name..."
        showYear={false}
        showClass={false}
        showSport={false}
        showStatus={false}
        onReset={() => setSearch("")}
      />

      {/* ================= DATA TABLE ================= */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          {cases.length === 0 && !loading ? (
            <div className="text-center py-5 text-muted">
              <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                <FiFileText size={28} className="text-slate-400 opacity-50" />
              </div>
              <h6 className="fw-bold mb-1 text-dark">No Records Found</h6>
              <p className="mb-0 small">
                There are currently no disciplinary logs in the system.
              </p>
            </div>
          ) : (
            <Table columns={columns} data={filteredCases} loading={loading} />
          )}
        </div>
      </div>

      {/* ================= 1. FILE REPORT MODAL ================= */}
      <Modal
        show={showCreate}
        onHide={() => !submitting && setShowCreate(false)}
        centered
        backdrop="static"
        size="lg"
      >
        <Modal.Header className="border-bottom bg-light pb-3 pt-4 px-4 d-flex justify-content-between align-items-center rounded-top-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-danger text-white rounded-circle p-2 shadow-sm">
              <FiAlertTriangle size={20} />
            </div>
            <div>
              <h5 className="fw-bolder mb-0 text-dark">File Official Report</h5>
            </div>
          </div>
          <button
            className="btn btn-white border rounded-circle p-2 text-muted shadow-sm hover-lift"
            onClick={() => !submitting && setShowCreate(false)}
          >
            <FiX size={18} />
          </button>
        </Modal.Header>

        <Modal.Body
          className="px-4 py-4"
          style={{ backgroundColor: "#f8fafc" }}
        >
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <div className="row g-4">
              {/* Category Selector (Filters the Athlete Dropdown) */}
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted text-uppercase tracking-wider">
                    Squad Category
                  </Form.Label>
                  <Form.Select
                    className="bg-light border-0 py-2 fw-medium shadow-none"
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                        playerId: "",
                      })
                    }
                  >
                    {(SPORT_META[sport]?.categories || ["U-15", "U-18"]).map(
                      (c) => (
                        <option key={c} value={c}>
                          {c} Squad
                        </option>
                      ),
                    )}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted text-uppercase tracking-wider">
                    Athlete <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    className="bg-light border-0 py-2 fw-medium shadow-none"
                    value={form.playerId}
                    onChange={(e) =>
                      setForm({ ...form, playerId: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select Offending Player...
                    </option>
                    {players.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted text-uppercase tracking-wider">
                    Infraction Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    className="bg-light border-0 py-2 fw-medium shadow-none"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="Misconduct">Misconduct / Behavior</option>
                    <option value="Attendance">Attendance Issue</option>
                    <option value="Equipment Violation">
                      Equipment Violation
                    </option>
                    <option value="Academic">Academic Eligibility</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted text-uppercase tracking-wider">
                    Severity Level <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    className="bg-light border-0 py-2 fw-medium shadow-none"
                    value={form.severity}
                    onChange={(e) =>
                      setForm({ ...form, severity: e.target.value })
                    }
                  >
                    <option value="low">Low (Warning)</option>
                    <option value="medium">Medium (Sanction)</option>
                    <option value="high">High (Suspension)</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-12">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted text-uppercase tracking-wider">
                    Brief Reason <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    className="bg-light border-0 py-2 fw-medium shadow-none"
                    placeholder="e.g., Late to match, Argument with official"
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                  />
                </Form.Group>
              </div>

              <div className="col-12">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted text-uppercase tracking-wider">
                    Detailed Description <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    className="bg-light border-0 py-3 fw-medium shadow-none"
                    placeholder="Provide a detailed objective account of the incident..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </Form.Group>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer
          className="border-0 px-4 pb-4 pt-2"
          style={{ backgroundColor: "#f8fafc" }}
        >
          <Button
            variant="white"
            className="fw-bold rounded-pill px-4 border shadow-sm"
            onClick={() => setShowCreate(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="fw-bold rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm hover-lift border-0"
            onClick={handleCreate}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" /> : <FiAlertTriangle />}
            {submitting ? "Filing..." : "Submit Official Report"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= 2. MANAGE CASE MODAL ================= */}
      <Modal
        show={!!editing}
        onHide={() => !submitting && setEditing(null)}
        centered
        backdrop="static"
        size="lg"
      >
        <Modal.Header className="border-bottom bg-light pb-3 pt-4 px-4 d-flex justify-content-between align-items-center rounded-top-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary text-white rounded-circle p-2 shadow-sm">
              <FiEdit3 size={20} />
            </div>
            <div>
              <h5 className="fw-bolder mb-0 text-dark">Manage Case Record</h5>
            </div>
          </div>
          <button
            className="btn btn-white border rounded-circle p-2 text-muted shadow-sm hover-lift"
            onClick={() => !submitting && setEditing(null)}
          >
            <FiX size={18} />
          </button>
        </Modal.Header>

        <Modal.Body
          className="px-4 py-4"
          style={{ backgroundColor: "#f8fafc" }}
        >
          {editing && (
            <>
              {/* Context Strip */}
              <div className="d-flex align-items-center justify-content-between bg-white border p-3 rounded-4 shadow-sm mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <FiUser size={18} />
                  </div>
                  <div>
                    <span className="fw-bolder text-dark d-block">
                      {editing?.playerId?.firstName}{" "}
                      {editing?.playerId?.lastName}
                    </span>
                    <span className="small text-muted fw-medium">
                      {editing?.type} • ID:{" "}
                      {editing?._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
                {getStatusBadge(editing.status)}
              </div>

              {/* Form Data */}
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <div className="row g-4">
                  <div className="col-md-8">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase tracking-wider">
                        Brief Reason <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        className="bg-light border-0 py-2 fw-medium shadow-none"
                        value={editing.reason}
                        onChange={(e) =>
                          setEditing({ ...editing, reason: e.target.value })
                        }
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase tracking-wider">
                        Severity Level
                      </Form.Label>
                      <Form.Select
                        className="bg-light border-0 py-2 fw-medium shadow-none"
                        value={editing.severity}
                        onChange={(e) =>
                          setEditing({ ...editing, severity: e.target.value })
                        }
                      >
                        <option value="low">Low (Warning)</option>
                        <option value="medium">Medium (Sanction)</option>
                        <option value="high">High (Suspension)</option>
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-12">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase tracking-wider">
                        Detailed Description{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        className="bg-light border-0 py-3 fw-medium shadow-none"
                        value={editing.description}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            description: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>

              {/* Status Action Strip */}
              <div className="card border-0 shadow-sm rounded-4 p-3 mt-4 bg-primary bg-opacity-10 border border-primary border-opacity-25">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="fw-bold text-primary mb-1">
                      Case Resolution
                    </h6>
                    <span className="small text-primary opacity-75">
                      Close this case if the disciplinary action has been
                      completed.
                    </span>
                  </div>
                  <div style={{ minWidth: "150px" }}>
                    <Form.Select
                      className="bg-white border-0 py-2 fw-bold text-dark shadow-sm rounded-3"
                      value={editing.status}
                      onChange={(e) =>
                        setEditing({ ...editing, status: e.target.value })
                      }
                    >
                      <option value="open">Keep Open</option>
                      <option value="resolved">Mark Resolved</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer
          className="border-0 px-4 pb-4 pt-2"
          style={{ backgroundColor: "#f8fafc" }}
        >
          <Button
            variant="white"
            className="fw-bold rounded-pill px-4 border shadow-sm"
            onClick={() => setEditing(null)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="fw-bold rounded-pill px-4 shadow-sm hover-lift d-flex align-items-center gap-2 border-0"
            onClick={handleUpdate}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" /> : <FiEdit3 />}
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= INLINE STYLES ================= */}
      <style>{`
        /* Overriding native Table component padding to match enterprise card feel */
        .table > :not(caption) > * > * {
           padding: 1rem 1.5rem;
        }
        .table > thead > tr > th {
           background-color: transparent !important;
           border-bottom: 2px solid #f1f5f9 !important;
           font-size: 0.75rem;
           color: #64748b !important;
        }
        .table > tbody > tr > td {
           border-bottom: 1px solid #f8fafc;
        }
        .table > tbody > tr:hover > td {
           background-color: #f8fafc !important;
        }
        
        .tracking-wider { letter-spacing: 0.05em; }
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.15) !important; cursor: pointer; }
      `}</style>
    </div>
  );
}
