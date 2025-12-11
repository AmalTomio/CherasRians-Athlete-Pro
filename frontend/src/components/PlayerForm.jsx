import { useState } from "react";
import { SPORT_META } from "../config/sportMeta";

export default function PlayerForm({ player, onClose, onSave }) {
  if (!player) return null; // safety

  const sport = player.sport;
  const meta = SPORT_META[sport] || {
    categories: [],
    positions: [],
    badmintonCategories: [],
  };

  const [category, setCategory] = useState(player.category || "");
  const [position, setPosition] = useState(player.position || "");
  const [badmintonCategory, setBadmintonCategory] = useState(
    player.badmintonCategory || ""
  );
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

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-card">
        <h4 className="mb-3">Edit Player</h4>

        <p>
          <strong>Name:</strong> {player.firstName} {player.lastName}
        </p>
        <p>
          <strong>Class:</strong> {player.classGroup}
        </p>
        <p>
          <strong>Year:</strong> {player.year}
        </p>

        {/* CATEGORY */}
        <label className="form-label fw-bold">Category</label>
        <select
          className="form-select mb-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {meta.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* BADMINTON OR OTHER SPORTS */}
        {sport === "badminton" ? (
          <>
            <label className="form-label fw-bold">Event Category</label>
            <select
              className="form-select mb-3"
              value={badmintonCategory}
              onChange={(e) => setBadmintonCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {meta.badmintonCategories.map((bc) => (
                <option key={bc} value={bc}>
                  {bc}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label className="form-label fw-bold">Position</label>
            <select
              className="form-select mb-3"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            >
              <option value="">Select Position</option>
              {meta.positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </>
        )}

        {/* STATUS */}
        <label className="form-label fw-bold">Status</label>
        <select
          className="form-select mb-4"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="injured">Injured</option>
          <option value="not_active">Not Active</option>
        </select>

        <div className="d-flex justify-content-between">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
