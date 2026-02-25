import { useState, useMemo, useCallback } from "react";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiUser,
  FiUsers,
  FiSearch,
  FiX,
  FiCalendar,
  FiMessageSquare,
  FiClock,
  FiCheckCircle
} from "react-icons/fi";

import useDebouncedUserSearch from "../../hooks/useDebouncedUserSearch";
import useAnnouncements from "../../hooks/useAnnouncements";

export default function ExcoAnnouncements() {

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [broadcastMode, setBroadcastMode] = useState("none");
  const [targetRoles, setTargetRoles] = useState([]);

  const [loading, setLoading] = useState(false);

  const { announcements, refresh } = useAnnouncements();
  const searchResults = useDebouncedUserSearch(search, null);

  const formatForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const changeMode = useCallback((mode) => {
    setBroadcastMode(mode);
    setSelectedUsers([]);
    setTargetRoles([]);
  }, []);

  const addUser = useCallback((user) => {
    setSelectedUsers(prev => {
      if (prev.find(u => u._id === user._id)) return prev;
      return [...prev, user];
    });
    setSearch("");
  }, []);

  const removeUser = useCallback((id) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== id));
  }, []);

  const getInitials = (f, l) =>
    `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

  const toggleRole = useCallback((role) => {
    setTargetRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title,
        content,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      };

      if (broadcastMode === "none") {
        if (!selectedUsers.length)
          throw new Error("Please select at least one user.");
        payload.targetUsers = selectedUsers.map(u => u._id);
      }

      if (broadcastMode === "roles") {
        if (!targetRoles.length)
          throw new Error("Please select at least one role.");
        payload.targetRoles = targetRoles;
      }

      await api.post("/announcements", payload);

      setTitle("");
      setContent("");
      setExpiryDate("");
      setSelectedUsers([]);
      setBroadcastMode("none");
      setTargetRoles([]);

      refresh();
      successAlert("Announcement sent successfully!");
    } catch (err) {
      errorAlert(err.response?.data?.message || err.message || "Error sending announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1 text-dark" style={{ letterSpacing: "-0.5px" }}>Broadcast Center</h2>
        <p className="text-muted">Manage announcements for students and coaches.</p>
      </div>

      <div className="row g-4">
        {/* ================= LEFT: CREATE FORM ================= */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-4">
              <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                <FiSend className="text-primary" /> New Announcement
              </h5>
            </div>
            
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Headline */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Headline</label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light border-0 fw-bold text-dark"
                    placeholder="e.g. Important Notice"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Message</label>
                  <textarea
                    className="form-control bg-light border-0"
                    rows="4"
                    placeholder="Write your message here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    style={{ resize: "none" }}
                  />
                </div>

                {/* --- BROADCAST MODES --- */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary small text-uppercase mb-2">Audience</label>
                  <div className="row g-2">
                    {/* Mode: Specific Users */}
                    <div className="col-6">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-3 border text-center cursor-pointer h-100 d-flex flex-column align-items-center justify-content-center ${broadcastMode === "none" ? "bg-primary-subtle border-primary text-primary" : "bg-light border-light text-muted"}`}
                        onClick={() => changeMode("none")}
                      >
                        <FiUser size={20} className="mb-2" />
                        <span className="fw-bold small">Specific People</span>
                      </motion.div>
                    </div>

                    {/* Mode: By Role */}
                    <div className="col-6">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-3 border text-center cursor-pointer h-100 d-flex flex-column align-items-center justify-content-center ${broadcastMode === "roles" ? "bg-indigo-subtle text-indigo border-indigo" : "bg-light border-light text-muted"}`}
                        onClick={() => changeMode("roles")}
                      >
                        <FiUsers size={20} className="mb-2" />
                        <span className="fw-bold small">By Group (Role)</span>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* --- CONDITIONAL INPUTS --- */}
                <AnimatePresence mode="wait">
                  {/* 1. SEARCH USERS */}
                  {broadcastMode === "none" && (
                    <motion.div
                      key="search-users"
                      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                      animate={{ opacity: 1, height: "auto", transitionEnd: { overflow: "visible" } }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      className="mb-4 position-relative"
                    >
                      <label className="form-label fw-bold text-secondary small">Search Recipients</label>
                      <div className="input-group mb-2">
                        <span className="input-group-text bg-white border-end-0 text-primary"><FiSearch /></span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Type student or coach name..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>

                      <AnimatePresence>
                        {search.trim() && searchResults.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="list-group position-absolute w-100 shadow-lg border-1 border-light rounded-3 overflow-auto" 
                            style={{ zIndex: 1050, top: "100%", marginTop: "4px", maxHeight: "250px" }}
                          >
                            {searchResults.map((u) => (
                              <button
                                type="button"
                                key={u._id}
                                className="list-group-item list-group-item-action d-flex align-items-center gap-3 px-3 py-2 bg-white"
                                onClick={() => addUser(u)}
                              >
                                <div className="rounded-circle bg-light fw-bold d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontSize: 12 }}>
                                  {getInitials(u.firstName, u.lastName)}
                                </div>
                                <div className="text-start">
                                  <div className="fw-bold text-dark">{u.firstName} {u.lastName}</div>
                                  <small className="text-muted text-capitalize">{u.role} {u.sport && `• ${u.sport}`}</small>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="d-flex flex-wrap gap-2 mt-3">
                        <AnimatePresence>
                          {selectedUsers.map((u) => (
                            <motion.span 
                              key={u._id}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              className="badge bg-white text-dark border rounded-pill ps-3 pe-2 py-2 d-flex align-items-center gap-2 shadow-sm"
                            >
                              {u.firstName} {u.lastName}
                              <button type="button" onClick={() => removeUser(u._id)} className="btn btn-sm p-0 text-muted hover-danger ms-1">
                                <FiX size={14} />
                              </button>
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* 2. ROLE SELECT */}
                  {broadcastMode === "roles" && (
                    <motion.div
                      key="role-select"
                      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                      animate={{ opacity: 1, height: "auto", transitionEnd: { overflow: "visible" } }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      className="mb-4"
                    >
                      <label className="form-label fw-bold text-secondary small">Select Groups</label>
                      <div className="d-flex gap-3">
                        {['student', 'coach'].map((role) => (
                          <motion.div 
                            key={role}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleRole(role)}
                            className={`flex-grow-1 p-3 rounded-3 border text-center cursor-pointer ${targetRoles.includes(role) ? "bg-indigo text-white border-indigo" : "bg-white text-secondary border-secondary-subtle"}`}
                            style={{ transition: "all 0.2s" }}
                          >
                            <span className="fw-bold text-capitalize">{role}s</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expiry */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary small text-uppercase d-flex justify-content-between">
                    <span>Expiry (Optional)</span>
                    {expiryDate && <span className="text-primary cursor-pointer" onClick={() => setExpiryDate("")}>Clear</span>}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted"><FiCalendar /></span>
                    <input
                      type="datetime-local"
                      className="form-control border-start-0 ps-0"
                      value={expiryDate}
                      min={formatForInput(new Date())}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      style={{ color: expiryDate ? "#000" : "#6c757d" }}
                    />
                  </div>
                  {expiryDate && (
                    <div className="mt-2 small text-success d-flex align-items-center gap-1">
                      <FiCheckCircle /> Expires on {new Date(expiryDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  )}
                </div>

                <motion.button 
                  type="submit" 
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn w-100 fw-bold text-white shadow-sm py-3"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", borderRadius: "10px", border: "none" }}
                >
                  {loading ? "Sending..." : "Send Announcement"}
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: HISTORY ================= */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold m-0 text-dark">Recent Activity</h5>
              <span className="badge bg-light text-secondary border">{announcements.length}</span>
            </div>

            <div className="card-body p-0 overflow-auto" style={{ maxHeight: "750px" }}>
              {announcements.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <FiMessageSquare size={32} className="mb-2 opacity-25" />
                  <p className="m-0">No announcements yet.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  <AnimatePresence>
                    {announcements.map((a, i) => (
                      <motion.div 
                        key={a._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="list-group-item border-0 border-bottom p-4 hover-bg-light"
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold text-dark m-0">{a.title}</h6>
                          <div className="d-flex align-items-center gap-1 text-muted small">
                            <FiClock size={12} />
                            <span style={{ fontSize: "0.7rem" }}>
                              {new Date(a.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-secondary small mb-3 lh-sm text-break">
                          {a.content}
                        </p>

                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-muted fw-bold" style={{ width: 24, height: 24, fontSize: "10px" }}>
                              {getInitials(a.createdBy?.firstName, a.createdBy?.lastName)}
                            </div>
                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                              {a.createdBy?.firstName}
                            </small>
                          </div>

                          {/* Audience Badge */}
                          {a.targetRoles?.length > 0 ? (
                            <span className="badge bg-indigo-subtle text-indigo border-indigo" style={{ fontSize: "0.65rem", background: "#e0e7ff", color: "#4338ca", borderColor: "#c7d2fe" }}>
                              {a.targetRoles.map(r => r + "s").join(" & ")}
                            </span>
                          ) : a.targetUsers?.length > 0 ? (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: "0.65rem" }}>
                              Specific Users
                            </span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: "0.65rem" }}>
                              General
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>
        {`
          .bg-indigo { background-color: #4338ca; }
          .bg-indigo-subtle { background-color: #e0e7ff; }
          .text-indigo { color: #4338ca; }
          .border-indigo { border-color: #c7d2fe; }
          .hover-danger:hover { color: #ef4444 !important; }
          .hover-bg-light:hover { background-color: #f8f9fa; }
        `}
      </style>
    </div>
  );
}