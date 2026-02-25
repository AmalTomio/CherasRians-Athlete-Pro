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
  const searchResults = useDebouncedUserSearch(search, null); // Exco not sport scoped

  const formatForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  /* ================= SAFE MODE SWITCH ================= */
  const changeMode = useCallback((mode) => {
    setBroadcastMode(mode);
    setSelectedUsers([]);
    setTargetRoles([]);
  }, []);

  /* ================= USER MANAGEMENT ================= */
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

  /* ================= ROLE MANAGEMENT ================= */
  const toggleRole = useCallback((role) => {
    setTargetRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  }, []);

  /* ================= SUBMIT ================= */
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

      <h2 className="fw-bold mb-1 text-dark">Broadcast Center</h2>
      <p className="text-muted">Manage announcements for students and coaches.</p>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Headline"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          required
        />

        <textarea
          className="form-control mb-3"
          placeholder="Message"
          value={content}
          onChange={(e)=>setContent(e.target.value)}
          required
        />

        <div className="d-flex gap-2 mb-3">
          <button type="button" onClick={()=>changeMode("none")} className="btn btn-light">
            Specific
          </button>
          <button type="button" onClick={()=>changeMode("roles")} className="btn btn-light">
            By Role
          </button>
        </div>

        {broadcastMode === "none" && (
          <>
            <input
              className="form-control mb-2"
              placeholder="Search users..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />

            {(Array.isArray(searchResults) ? searchResults : []).map(u => (
              <div key={u._id} onClick={()=>addUser(u)}>
                {u.firstName} {u.lastName}
              </div>
            ))}
          </>
        )}

        {broadcastMode === "roles" && (
          <div className="mb-3">
            {["student","coach"].map(role => (
              <button
                key={role}
                type="button"
                onClick={()=>toggleRole(role)}
                className="btn btn-outline-secondary me-2"
              >
                {role}s
              </button>
            ))}
          </div>
        )}

        <button className="btn btn-primary w-100">
          {loading ? "Sending..." : "Send Announcement"}
        </button>

      </form>

      <hr/>

      {announcements.map(a => (
        <div key={a._id}>
          <b>{a.title}</b>
          <p>{a.content}</p>
        </div>
      ))}

    </div>
  );
}