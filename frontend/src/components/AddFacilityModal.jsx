import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AddFacilityModal({ show, onClose, onSaved, facility }) {
  const isEdit = Boolean(facility);

  const [form, setForm] = useState({
    name: "",
    type: "",
    capacity: "",
    status: "available",
  });

  useEffect(() => {
    if (facility) {
      setForm({
        name: facility.name || "",
        type: facility.type || "",
        capacity: facility.capacity ?? "",
        status: facility.status || "available",
      });
    } else {
      setForm({
        name: "",
        type: "",
        capacity: "",
        status: "available",
      });
    }
  }, [facility]);

  if (!show) return null;

  const submit = async () => {
    const payload = {
      name: form.name.trim(),
      type: form.type.trim(),
      status: form.status,
      capacity: Number(form.capacity) || 0,
    };

    if (isEdit) {
      await api.put(`/facilities/${facility._id}`, payload);
    } else {
      await api.post("/facilities", payload);
    }

    onSaved();
    onClose();
  };

  return (
    <div className="modal d-block show bg-dark bg-opacity-50">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content rounded-4">
          <div
            className="modal-header text-white"
            style={{
              background: "linear-gradient(90deg, #3b82f6, #6366f1, #9333ea)",
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
            }}
          >
            <h5 className="modal-title fw-semibold">
              {isEdit ? "Edit Facility" : "Add Facility"}
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body row g-3">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Facility Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Type (e.g. Indoor Court)"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <input
                type="number"
                className="form-control"
                placeholder="Capacity"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={submit}>
              {isEdit ? "Update Facility" : "Create Facility"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
