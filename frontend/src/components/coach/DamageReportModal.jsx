import { useState } from "react";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";

export default function DamageReportModal({ equipment, onClose, onSaved }) {
  const [quantity, setQuantity] = useState(1);
  const [severity, setSeverity] = useState("low");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (quantity < 1) return errorAlert("Invalid quantity");

    const form = new FormData();
    form.append("equipmentId", equipment._id);
    form.append("quantityDamaged", quantity);
    form.append("severity", severity);
    form.append("description", description);
    images.forEach((f) => form.append("images", f));

    try {
      setSaving(true);
      await api.post("/equipment/report-damage", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      successAlert("Damage reported");
      onSaved();
      onClose();
    } catch (err) {
      errorAlert("Failed to report damage");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header bg-danger text-white">
              <h5>Report Damage – {equipment.name}</h5>
              <button className="btn-close btn-close-white" onClick={onClose} />
            </div>

            <div className="modal-body">
              <label className="form-label">Quantity Damaged</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max={equipment.quantityAvailable}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />

              <label className="form-label mt-3">Severity</label>
              <select
                className="form-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <label className="form-label mt-3">Description</label>
              <textarea
                className="form-control"
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label className="form-label mt-3">Upload Images</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                multiple
                onChange={(e) => setImages([...e.target.files])}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={saving}
                onClick={submit}
              >
                {saving ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
