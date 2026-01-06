import { useState } from "react";
import api from "../../api/axios";
import { errorAlert, successAlert } from "../../utils/swal";

export default function DamageReportModal({
  show,
  onClose,
  equipmentList = [],
  onReported,
}) {
  const [equipmentId, setEquipmentId] = useState("");
  const [quantityDamaged, setQuantityDamaged] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!show) return null;

  const selectedEquipment = equipmentList.find(
    (e) => e._id === equipmentId
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!equipmentId || !quantityDamaged || quantityDamaged < 1) {
      return errorAlert("Please select equipment and enter valid quantity.");
    }

    if (
      selectedEquipment &&
      quantityDamaged > selectedEquipment.quantityAvailable
    ) {
      return errorAlert("Damaged quantity exceeds available equipment.");
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("equipmentId", equipmentId);
      formData.append("quantityDamaged", quantityDamaged);
      formData.append("description", description);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.post("/equipment/report-damage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      successAlert("Damage report submitted successfully.");
      onReported?.();
      onClose();
    } catch (err) {
      console.error(err);
      errorAlert("Failed to submit damage report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      {/* Modal */}
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 overflow-hidden">

            {/* Header */}
            <div
              className="modal-header text-white"
              style={{
                background:
                  "linear-gradient(135deg, #ef4444, #dc2626)",
              }}
            >
              <h5 className="modal-title fw-semibold d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill"></i>
                Report Equipment Damage
              </h5>
              <button
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>

            {/* Body */}
            <div className="modal-body p-4">
              {/* Equipment Selection */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Equipment
                </label>
                <select
                  className="form-select"
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                >
                  <option value="">Select equipment</option>
                  {equipmentList.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name} (Available: {e.quantityAvailable})
                    </option>
                  ))}
                </select>

                {selectedEquipment && (
                  <div className="small text-muted mt-1">
                    Category: {selectedEquipment.category}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Quantity Damaged
                </label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max={selectedEquipment?.quantityAvailable || 1}
                  value={quantityDamaged}
                  onChange={(e) =>
                    setQuantityDamaged(Number(e.target.value))
                  }
                />
                <small className="text-muted">
                  Max allowed:{" "}
                  {selectedEquipment?.quantityAvailable ?? 0}
                </small>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Description (optional)
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe the damage..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Damage Evidence
                </label>

                <div className="border rounded-3 p-3 bg-light">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="form-control"
                    onChange={handleImageChange}
                  />

                  {preview && (
                    <div className="mt-3 text-center">
                      <img
                        src={preview}
                        alt="Damage preview"
                        className="img-fluid rounded shadow-sm"
                        style={{ maxHeight: 200 }}
                      />
                      <div className="small text-muted mt-2">
                        Image preview
                      </div>
                    </div>
                  )}
                </div>

                <small className="text-muted d-block mt-1">
                  Take a clear photo of the damaged equipment.
                </small>
              </div>

              {/* Info */}
              <div className="alert alert-warning small">
                <i className="bi bi-info-circle me-2"></i>
                Submitting this report will automatically deduct the damaged
                quantity from available equipment.
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer px-4 py-3">
              <button
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger"
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2"></i>
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
