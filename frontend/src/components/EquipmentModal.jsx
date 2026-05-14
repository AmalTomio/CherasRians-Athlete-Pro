import { useState } from "react";
import api from "../api/axios";
import { errorAlert } from "../utils/swal";
import { PackageIcon } from "@primer/octicons-react";
import { FiBox, FiTag, FiHash, FiCheck, FiX } from "react-icons/fi";

export default function EquipmentModal({ onClose, onSaved, editData }) {
  const [name, setName] = useState(editData?.name || "");
  const [category, setCategory] = useState(editData?.category || "");
  const [quantity, setQuantity] = useState(editData?.quantityTotal || "");
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
      if (editData) {
        await api.put(`/equipment/${editData._id}`, {
          name,
          quantityTotal: quantity,
          category,
        });
      } else {
        await api.post("/equipment", {
          name,
          quantityTotal: quantity,
          category,
        });
      }
      onSaved();
    } catch (err) {
      errorAlert(err.response?.data?.message || "Failed to save equipment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Subtle blur backdrop */}
      <div 
        className="modal-backdrop show" 
        style={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(15, 23, 42, 0.4)" }}
      ></div>

      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div 
            className="modal-content border-0 shadow-lg modal-animate" 
            style={{ borderRadius: "20px", overflow: "hidden" }}
          >
            {/* ===== HEADER ===== */}
            <div
              className="modal-header border-0 px-4 pt-4 pb-3"
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center shadow-sm"
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
                    borderRadius: "14px",
                    color: "white"
                  }}
                >
                  <PackageIcon size={24} />
                </div>
                <div>
                  <h5 className="mb-0 fw-bold text-dark" style={{ letterSpacing: "-0.5px" }}>
                    {editData ? "Edit Equipment" : "Add New Equipment"}
                  </h5>
                  <small className="text-muted fw-medium">
                    {editData ? "Update item details in inventory" : "Register new item into inventory"}
                  </small>
                </div>
              </div>
              <button
                className="btn-close bg-white shadow-sm rounded-circle p-2"
                style={{ opacity: 1 }}
                onClick={onClose}
              ></button>
            </div>

            {/* ===== BODY ===== */}
            <div className="modal-body p-4 bg-white">
              {/* Equipment Name */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
                  Equipment Name
                </label>
                <div className="input-group input-group-lg shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                  <span className="input-group-text bg-light border-end-0 text-primary px-3">
                    <FiBox size={20} />
                  </span>
                  <input
                    className="form-control border-start-0 ps-2 bg-light custom-input"
                    placeholder="e.g. Football Size 5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
                  Category
                </label>
                <div className="input-group input-group-lg shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                  <span className="input-group-text bg-light border-end-0 text-primary px-3">
                    <FiTag size={20} />
                  </span>
                  <select
                    className="form-select border-start-0 ps-2 bg-light custom-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="" disabled>Select category...</option>
                    {EQUIPMENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-2">
                <label className="form-label fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
                  Total Quantity
                </label>
                <div className="input-group input-group-lg shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                  <span className="input-group-text bg-light border-end-0 text-primary px-3">
                    <FiHash size={20} />
                  </span>
                  <input
                    type="number"
                    className="form-control border-start-0 ps-2 bg-light custom-input"
                    min="1"
                    inputMode="numeric"
                    placeholder="Enter quantity amount"
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
            </div>

            {/* ===== FOOTER ===== */}
            <div className="modal-footer px-4 py-3 border-top-0 bg-white d-flex gap-2">
              <button
                className="btn btn-light rounded-pill px-4 fw-semibold shadow-sm d-flex align-items-center gap-2"
                onClick={onClose}
                disabled={saving}
              >
                <FiX size={18} /> Cancel
              </button>

              <button
                className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                onClick={submit}
                disabled={saving}
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)", border: "none" }}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiCheck size={18} /> {editData ? "Save Changes" : "Add Equipment"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .modal-animate {
          animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .custom-input:focus {
          box-shadow: none !important;
          border-color: #dee2e6 !important;
          background-color: #fff !important;
        }

        .input-group:focus-within {
          box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25) !important;
          border-radius: 12px;
        }

        .input-group:focus-within .input-group-text,
        .input-group:focus-within .custom-input {
          background-color: #fff !important;
        }

        @keyframes modalPop {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}