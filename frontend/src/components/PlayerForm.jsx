import React, { useState } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import { FiUser, FiSave, FiX, FiActivity, FiTag, FiAward } from "react-icons/fi";
import { SPORT_META } from "../config/sportMeta";

export default function PlayerForm({ player, onClose, onSave }) {
  if (!player) return null; // safety

  const sport = player.sport || "football"; // fallback just in case
  const meta = SPORT_META[sport] || {
    categories: [],
    positions: [],
    badmintonCategories: [],
  };

  const [category, setCategory] = useState(player.category || "");
  const [position, setPosition] = useState(player.position || "");
  const [badmintonCategory, setBadmintonCategory] = useState(player.badmintonCategory || "");
  const [status, setStatus] = useState(player.status || "active");

  const handleSubmit = () => {
    const payload = { category, status };

    if (sport === "badminton") {
      payload.badmintonCategory = badmintonCategory;
    } else {
      payload.position = position;
    }

    onSave(player._id, payload);
  };

  // Determine badge color based on current status
  const getStatusBadge = (currentStatus) => {
    switch (currentStatus) {
      case "active": return "success";
      case "injured": return "danger";
      case "not_active": return "secondary";
      default: return "primary";
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered backdrop="static" size="md">
      {/* ================= MODAL HEADER ================= */}
      <Modal.Header className="border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-start">
        <div>
          <h5 className="fw-bolder mb-1 text-dark d-flex align-items-center gap-2">
            <FiEdit3 className="text-primary" /> Edit Roster Details
          </h5>
          <p className="text-muted small mb-0">Update classification and status for this athlete.</p>
        </div>
        <button 
          className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-muted hover-lift" 
          onClick={onClose}
        >
          <FiX size={20} />
        </button>
      </Modal.Header>

      {/* ================= MODAL BODY ================= */}
      <Modal.Body className="px-4 py-4">
        
        {/* Read-Only Player Context Card */}
        <div className="bg-light rounded-4 p-3 mb-4 d-flex align-items-center gap-3 border">
          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
            <FiUser size={24} />
          </div>
          <div className="flex-grow-1">
            <h6 className="fw-bold mb-1 text-dark m-0">
              {player.firstName} {player.lastName}
            </h6>
            <div className="d-flex gap-2 mt-1">
              <Badge bg="white" text="dark" className="border shadow-sm fw-medium">Form {player.year}</Badge>
              <Badge bg="white" text="dark" className="border shadow-sm fw-medium">Class {player.classGroup}</Badge>
            </div>
          </div>
          <div className="text-end">
            <Badge bg={getStatusBadge(status)} className="px-2 py-1 text-capitalize shadow-sm">
              {status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="d-flex flex-column gap-3">
          
          {/* CATEGORY */}
          <Form.Group>
            <Form.Label className="small fw-bold text-uppercase text-muted mb-1 d-flex align-items-center gap-1" style={{ letterSpacing: '0.5px' }}>
              <FiTag /> Squad Category
            </Form.Label>
            <Form.Select
              className="bg-light border-0 py-2 fw-medium shadow-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>Select Category...</option>
              {meta.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* DYNAMIC FIELD: BADMINTON OR OTHER SPORTS */}
          {sport === "badminton" ? (
            <Form.Group>
              <Form.Label className="small fw-bold text-uppercase text-muted mb-1 d-flex align-items-center gap-1" style={{ letterSpacing: '0.5px' }}>
                <FiAward /> Event Category
              </Form.Label>
              <Form.Select
                className="bg-light border-0 py-2 fw-medium shadow-none"
                value={badmintonCategory}
                onChange={(e) => setBadmintonCategory(e.target.value)}
              >
                <option value="" disabled>Select Event...</option>
                {meta.badmintonCategories.map((bc) => (
                  <option key={bc} value={bc}>{bc}</option>
                ))}
              </Form.Select>
            </Form.Group>
          ) : (
            <Form.Group>
              <Form.Label className="small fw-bold text-uppercase text-muted mb-1 d-flex align-items-center gap-1" style={{ letterSpacing: '0.5px' }}>
                <FiActivity /> Position
              </Form.Label>
              <Form.Select
                className="bg-light border-0 py-2 fw-medium shadow-none"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value="" disabled>Select Position...</option>
                {meta.positions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* STATUS */}
          <Form.Group>
            <Form.Label className="small fw-bold text-uppercase text-muted mb-1 d-flex align-items-center gap-1" style={{ letterSpacing: '0.5px' }}>
              <FiActivity /> Active Status
            </Form.Label>
            <Form.Select
              className="bg-light border-0 py-2 fw-medium shadow-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="injured">Injured</option>
              <option value="not_active">Not Active</option>
            </Form.Select>
          </Form.Group>

        </div>
      </Modal.Body>

      {/* ================= MODAL FOOTER ================= */}
      <Modal.Footer className="border-0 px-4 pb-4 pt-2">
        <Button variant="light" className="fw-bold rounded-pill px-4 border" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="fw-bold rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm hover-lift" onClick={handleSubmit}>
          <FiSave /> Save Changes
        </Button>
      </Modal.Footer>

      {/* ================= INLINE STYLES ================= */}
      <style>{`
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.15) !important; cursor: pointer; }
        
        /* Ensure disabled placeholder options look muted */
        select option[disabled] { color: #94a3b8; }
      `}</style>
    </Modal>
  );
}

// Temporary icon component fallback since FiEdit3 wasn't explicitly imported above
function FiEdit3(props) {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  );
}