import { useState } from "react";
import api from "../api/axios";
import { errorAlert } from "../utils/swal";
import { PackageIcon } from "@primer/octicons-react";

export default function EquipmentModal({ onClose, onSaved }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  const EQUIPMENT_CATEGORIES = [
    "Balls",
    "Training Aids",
    "Protective Gear",
    "Apparel",
    "Accessories",
    "Fitness Equipment",
    "Match Equipment",
    "Others",
  ];

  const submit = async () => {
    if (!name || !category || !quantity || quantity < 1) {
      return errorAlert("Name and quantity are required");
    }

    try {
      setSaving(true);
      await api.post("/equipment", {
        name,
        quantityTotal: quantity,
        category,
      });
      onSaved();
    } catch (err) {
      errorAlert(err.response?.data?.message || "Failed to add equipment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      {/* Modal */}
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            {/* ===== HEADER ===== */}
            <div
              className="modal-header text-white"
              style={{
                background: "linear-gradient(90deg, #3b82f6, #6366f1, #9333ea)",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{
                    width: 44,
                    height: 44,
                    background: "rgba(255,255,255,0.2)",
                  }}
                >
                  <PackageIcon size={22} />
                </div>
                <div>
                  <h5 className="mb-0 fw-semibold">Add New Equipment</h5>
                  <small className="opacity-75">
                    Register equipment into inventory
                  </small>
                </div>
              </div>

              <button
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            {/* ===== BODY ===== */}
            <div className="modal-body p-4">
              {/* Equipment Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Equipment Name</label>
                <input
                  className="form-control form-control-lg"
                  placeholder="e.g. Football Size 5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Category</label>
                <select
                  className="form-select form-select-lg"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  {EQUIPMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="mb-2">
                <label className="form-label fw-semibold">Quantity</label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  min="1"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;

                    if (val === "") {
                      setQuantity("");
                      return;
                    }

                    const num = Number(val);
                    if (!Number.isNaN(num) && num >= 1) {
                      setQuantity(num);
                    }
                  }}
                />
              </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div className="modal-footer px-4 pb-4 border-0">
              <button
                className="btn btn-outline-secondary px-4"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary px-4"
                onClick={submit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Saving...
                  </>
                ) : (
                  "Add Equipment"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
