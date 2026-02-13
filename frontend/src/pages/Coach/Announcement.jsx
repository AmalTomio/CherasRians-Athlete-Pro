import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function Announcements() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [announcements, setAnnouncements] = useState([]);


  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await api.get("/users/search", {
          params: { search },
        });
        setSearchResults(res.data.users);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const addUser = (user) => {
    if (!selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearch("");
    setSearchResults([]);
  };

  const removeUser = (id) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== id));
  };

  /* ================= CREATE ANNOUNCEMENT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/announcements", {
        title,
        content,
        targetUsers: selectedUsers.map((u) => u._id),
        expiryDate: expiryDate || null,
      });

      alert("Announcement sent successfully");

      setTitle("");
      setContent("");
      setExpiryDate("");
      setSelectedUsers([]);

      fetchAnnouncements();
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Error sending announcement");
    }
  };

  /* ================= FETCH ANNOUNCEMENTS ================= */

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">Announcements</h4>

      {/* ================= FORM ================= */}
      <div className="card shadow-sm p-4 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Content</label>
            <textarea
              className="form-control"
              rows="3"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* USER SEARCH */}
          <div className="mb-3 position-relative">
            <label className="form-label fw-semibold">
              Send To (Search by Name)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Search student or coach..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {searchResults.length > 0 && (
              <div
                className="list-group position-absolute w-100 shadow-sm"
                style={{ zIndex: 10 }}
              >
                {searchResults.map((u) => (
                  <button
                    type="button"
                    key={u._id}
                    className="list-group-item list-group-item-action"
                    onClick={() => addUser(u)}
                  >
                    {u.firstName} {u.lastName} ({u.role})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SELECTED USERS */}
          {selectedUsers.length > 0 && (
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-2">
                {selectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="badge bg-primary d-flex align-items-center gap-2"
                  >
                    {u.firstName} {u.lastName}
                    <button
                      type="button"
                      className="btn-close btn-close-white btn-sm"
                      onClick={() => removeUser(u._id)}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label fw-semibold">Expiry Date</label>
            <input
              type="datetime-local"
              className="form-control"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <button className="btn btn-primary">Send Announcement</button>
        </form>
      </div>

      {/* ================= LIST ================= */}
      <div className="card shadow-sm p-4">
        <h6 className="fw-bold mb-3">Recent Announcements</h6>

        {announcements.length === 0 ? (
          <p className="text-muted">No announcements available.</p>
        ) : (
          announcements.map((a) => (
            <div key={a._id} className="mb-3 border-bottom pb-2">
              <div className="fw-bold">{a.title}</div>
              <div className="text-muted small">
                By {a.createdBy?.firstName} {a.createdBy?.lastName}
              </div>
              <div>{a.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
