import { useState } from "react";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";

export default function ExcoAnnouncements() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [targetRoles, setTargetRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  /* ================= SEARCH USERS ================= */
  const searchUsers = async (q) => {
    setSearch(q);

    if (!q.trim()) {
      setUsers([]);
      return;
    }

    try {
      const res = await api.get("/users/search", {
        params: { search: q }
      });

      setUsers(res.data.users || []);
    } catch {
      errorAlert("Failed to search users");
    }
  };

  /* ================= TOGGLE USER ================= */
  const toggleUser = (user) => {
    const exists = selectedUsers.find(u => u._id === user._id);

    if (exists) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  /* ================= TOGGLE ROLE ================= */
  const toggleRole = (role) => {
    setTargetRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      await api.post("/announcements", {
        title,
        content,
        expiryDate,
        targetUsers: selectedUsers.map(u => u._id),

        // Role only used if no direct users
        targetRoles: selectedUsers.length ? [] : targetRoles,
      });

      successAlert("Announcement sent");

      setTitle("");
      setContent("");
      setExpiryDate("");
      setTargetRoles([]);
      setSelectedUsers([]);
      setUsers([]);
      setSearch("");

    } catch (err) {
      errorAlert(err.response?.data?.message || "Failed to send announcement");
    }
  };

  return (
    <div className="px-4 py-4">
      <h3 className="fw-bold mb-4">Create Announcement</h3>

      <div className="card shadow-sm p-4">

        {/* TITLE */}
        <input
          className="form-control mb-3"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {/* CONTENT */}
        <textarea
          className="form-control mb-3"
          placeholder="Message"
          rows={4}
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        {/* EXPIRY */}
        <input
          type="datetime-local"
          className="form-control mb-3"
          value={expiryDate}
          onChange={e => setExpiryDate(e.target.value)}
        />

        <hr />

        {/* DIRECT USERS */}
        <h6 className="fw-bold">Send to Specific Users</h6>
        <input
          className="form-control mb-2"
          placeholder="Search by name..."
          value={search}
          onChange={e => searchUsers(e.target.value)}
        />

        {users.map(u => (
          <div key={u._id}>
            <input
              type="checkbox"
              checked={selectedUsers.some(s => s._id === u._id)}
              onChange={() => toggleUser(u)}
            /> {u.firstName} {u.lastName} ({u.role})
          </div>
        ))}

        <hr />

        {/* ROLE TARGETING */}
        <h6 className="fw-bold">Send by Role (if no specific user selected)</h6>

        <label className="me-3">
          <input
            type="checkbox"
            checked={targetRoles.includes("student")}
            onChange={() => toggleRole("student")}
          /> Students
        </label>

        <label>
          <input
            type="checkbox"
            checked={targetRoles.includes("coach")}
            onChange={() => toggleRole("coach")}
          /> Coaches
        </label>

        <hr />

        <button className="btn btn-primary mt-3" onClick={handleSubmit}>
          Send Announcement
        </button>

      </div>
    </div>
  );
}
