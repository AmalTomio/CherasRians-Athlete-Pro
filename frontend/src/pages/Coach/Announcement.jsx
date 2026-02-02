import { useState, useEffect } from "react";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";

export default function CoachAnnouncements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRoles, setTargetRoles] = useState([]);
  const [targetSports, setTargetSports] = useState([]);
  const [targetCategories, setTargetCategories] = useState([]);
  const [expiryDate, setExpiryDate] = useState("");

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH ANNOUNCEMENTS
  ========================= */
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data.announcements || []);
    } catch {
      errorAlert("Failed to fetch announcements");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  /* =========================
     HANDLE CHECKBOX
  ========================= */
  const toggleSelection = (value, state, setter) => {
    if (state.includes(value)) {
      setter(state.filter((v) => v !== value));
    } else {
      setter([...state, value]);
    }
  };

  /* =========================
     CREATE ANNOUNCEMENT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !message) {
      return errorAlert("Title and message are required");
    }

    try {
      setLoading(true);

      await api.post("/announcements", {
        title,
        content: message,
        targetRoles,
        targetSports,
        targetCategories,
        expiryDate: expiryDate || null,
      });

      successAlert("Announcement created successfully");

      // Reset form
      setTitle("");
      setMessage("");
      setTargetRoles([]);
      setTargetSports([]);
      setTargetCategories([]);
      setExpiryDate("");

      fetchAnnouncements();
    } catch (err) {
      errorAlert(
        err.response?.data?.message || "Failed to create announcement",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4">
      <h2 className="fw-bold mb-3">Manage Announcements</h2>

      {/* ================= FORM ================= */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Title</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Message */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Message</label>
              <textarea
                className="form-control"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Target Roles */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Target Roles</label>
              <div className="d-flex gap-3">
                {["student", "coach", "exco"].map((role) => (
                  <div key={role} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={targetRoles.includes(role)}
                      onChange={() =>
                        toggleSelection(role, targetRoles, setTargetRoles)
                      }
                    />
                    <label className="form-check-label text-capitalize">
                      {role}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Sport */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Target Sport</label>
              <select
                className="form-select"
                onChange={(e) =>
                  setTargetSports(e.target.value ? [e.target.value] : [])
                }
              >
                <option value="">All Sports</option>
                <option value="football">Football</option>
                <option value="volleyball">Volleyball</option>
                <option value="sepak_takraw">Sepak Takraw</option>
                <option value="badminton">Badminton</option>
                <option value="netball">Netball</option>
              </select>
            </div>

            {/* Target Category */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Target Category</label>
              <select
                className="form-select"
                onChange={(e) =>
                  setTargetCategories(e.target.value ? [e.target.value] : [])
                }
              >
                <option value="">All Categories</option>
                <option value="U-15">U-15</option>
                <option value="U-18">U-18</option>
              </select>
            </div>

            {/* Expiry */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Expiry Date</label>
              <input
                type="datetime-local"
                className="form-control"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Announcement"}
            </button>
          </form>
        </div>
      </div>

      {/* ================= LIST ================= */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Active Announcements</h5>

          {announcements.length === 0 ? (
            <div className="text-muted">No announcements available</div>
          ) : (
            announcements.map((a) => (
              <div key={a._id} className="border rounded p-3 mb-3">
                <h6 className="fw-bold">{a.title}</h6>
                <p className="mb-1">{a.message}</p>
                {a.expiryDate && (
                  <small className="text-muted">
                    Expires: {new Date(a.expiryDate).toLocaleString()}
                  </small>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
