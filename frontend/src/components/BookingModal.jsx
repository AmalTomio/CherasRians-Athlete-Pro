// src/components/BookingModal.jsx
import { useState, useEffect } from "react";
import api from "../api/axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import { successAlert, errorAlert } from "../utils/swal";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingModal.css"; 

export default function BookingModal({ facility, onClose, onBooked }) {
  // Store slots as array of {date, hour, minute, ampm}
  const [slots, setSlots] = useState([]);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [reason, setReason] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Equipment Request States
  const [showEquipmentRequest, setShowEquipmentRequest] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Fetch available equipment when component mounts
  useEffect(() => {
    fetchAvailableEquipment();
  }, []);

  // Fetch available equipment
  const fetchAvailableEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const res = await api.get("/equipment/available");
      setEquipmentList(res.data);
    } catch (err) {
      console.error("Error fetching equipment:", err);
      errorAlert("Failed to load equipment list");
    } finally {
      setLoadingEquipment(false);
    }
  };

  // Add a new slot
  const addSlot = (date) => {
    if (!date) return;
    
    const dateString = moment(date).format("YYYY-MM-DD");
    const exists = slots.some(slot => slot.date === dateString);
    
    if (!exists) {
      setSlots([...slots, {
        date: dateString,
        hour: "9",
        minute: "00",
        ampm: "AM"
      }]);
    }
  };

  // Remove a slot
  const removeSlot = (dateString) => {
    setSlots(slots.filter(slot => slot.date !== dateString));
  };

  // Update a slot's time
  const updateSlotTime = (dateString, field, value) => {
    setSlots(slots.map(slot => 
      slot.date === dateString ? { ...slot, [field]: value } : slot
    ));
  };

  // Convert slot time to 24H format
  const getSlot24hTime = (slot) => {
    const timeString = `${slot.hour}:${slot.minute} ${slot.ampm}`;
    const momentTime = moment(timeString, "hh:mm A");
    return momentTime.isValid() ? momentTime.format("HH:mm") : "09:00";
  };

  // Check availability for all slots
  const checkAvailability = async () => {
    try {
      if (slots.length === 0) {
        return errorAlert("Please add at least one date-time slot.");
      }

      // Validate all slots have times
      const invalidSlots = slots.filter(slot => !slot.hour);
      if (invalidSlots.length > 0) {
        return errorAlert("Please set time for all selected dates.");
      }

      setChecking(true);
      setAvailable(null);

      // Prepare slots data for API
      const slotsData = slots.map(slot => ({
        date: slot.date,
        time: getSlot24hTime(slot)
      }));

      const res = await api.post("/bookings/check-availability", {
        facilityId: facility._id,
        slots: slotsData
      });
      
      setAvailable(res.data.available);
      
      if (res.data.available) {
        successAlert(`Available for ${slots.length} slot(s)!`);
      } else {
        // Show which slots have conflicts
        const conflictSlots = res.data.slotResults.filter(r => !r.available);
        if (conflictSlots.length > 0) {
          errorAlert(`Conflicts found for ${conflictSlots.length} slot(s)`);
        } else {
          errorAlert("Not available for the selected slots.");
        }
      }

    } catch (err) {
      console.error("Availability check error:", err);
      errorAlert("Failed to check availability. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  // Submit Equipment Request
  const submitEquipmentRequest = async () => {
    if (!selectedEquipment) {
      return errorAlert("Please select equipment to request");
    }
    
    if (requestQuantity < 1) {
      return errorAlert("Please enter a valid quantity");
    }

    try {
      setSubmittingRequest(true);
      
      // Get the first slot as reference date for equipment request
      const firstSlot = slots[0];
      if (!firstSlot) {
        return errorAlert("Please select at least one date-time slot first");
      }

      const requestData = {
        equipmentId: selectedEquipment,
        quantityRequested: requestQuantity,
        scheduleId: null, // This could be linked to a schedule if you have one
        note: `Booking for ${facility.name} on ${moment(firstSlot.date).format("MMM D, YYYY")}`
      };

      const res = await api.post("/equipment/requests", requestData);
      
      successAlert("Equipment request submitted successfully!");
      setShowEquipmentRequest(false);
      setSelectedEquipment("");
      setRequestQuantity(1);

    } catch (err) {
      console.error("Equipment request error:", err);
      errorAlert(err.response?.data?.message || "Failed to submit equipment request");
    } finally {
      setSubmittingRequest(false);
    }
  };

  // BOOKING REQUEST
  const submitBooking = async () => {
    if (available === null)
      return errorAlert("Please check availability first.");
    
    if (!available)
      return errorAlert("Facility is not available for booking.");

    if (!reason) 
      return errorAlert("Please select a reason for booking.");

    try {
      // Prepare slots data for API
      const slotsData = slots.map(slot => ({
        date: slot.date,
        time: getSlot24hTime(slot)
      }));

      const bookingData = {
        facilityId: facility._id,
        slots: slotsData,
        reason,
      };

      const res = await api.post("/bookings", bookingData);

      successAlert("Booking submitted successfully!");
      onBooked();
      onClose();

    } catch (err) {
      console.error("Booking error:", err.response?.data || err);
      errorAlert(err.response?.data?.message || "Booking failed. Please try again.");
    }
  };

  // Format slot for display
  const formatSlot = (slot) => {
    return `${moment(slot.date).format("ddd, MMM D")} at ${slot.hour}:${slot.minute} ${slot.ampm}`;
  };

  // Generate hours options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // Get selected equipment details
  const getSelectedEquipmentDetails = () => {
    return equipmentList.find(eq => eq._id === selectedEquipment);
  };

  const selectedEquipmentDetails = getSelectedEquipmentDetails();

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      
      {/* Modal */}
      <div 
        className="modal fade show d-block" 
        style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <div 
          className="modal-dialog modal-dialog-centered modal-lg"
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-content">
            
            {/* Modal Header */}
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="bi bi-calendar-plus me-2"></i>
                Book {facility.name}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
              ></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Selected Slots Summary */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Selected Date-Time Slots</h6>
                {slots.length === 0 ? (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    No slots selected. Click dates on the calendar to add slots.
                  </div>
                ) : (
                  <div className="border rounded p-3">
                    {slots.map((slot, index) => (
                      <div key={slot.date} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <div>
                          <i className="bi bi-calendar-event me-2"></i>
                          <strong>{moment(slot.date).format("ddd, MMM D YYYY")}</strong>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          {/* Time selection for this slot */}
                          <div className="d-flex align-items-center gap-2">
                            <select
                              className="form-select form-select-sm"
                              value={slot.hour}
                              onChange={(e) => updateSlotTime(slot.date, 'hour', e.target.value)}
                              style={{ width: '80px' }}
                            >
                              <option value="">Hour</option>
                              {hourOptions.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <span>:</span>
                            <select
                              className="form-select form-select-sm"
                              value={slot.minute}
                              onChange={(e) => updateSlotTime(slot.date, 'minute', e.target.value)}
                              style={{ width: '80px' }}
                            >
                              <option value="00">00</option>
                              <option value="15">15</option>
                              <option value="30">30</option>
                              <option value="45">45</option>
                            </select>
                            <div className="btn-group">
                              <button
                                className={`btn btn-sm ${slot.ampm === "AM" ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() => updateSlotTime(slot.date, 'ampm', "AM")}
                              >
                                AM
                              </button>
                              <button
                                className={`btn btn-sm ${slot.ampm === "PM" ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() => updateSlotTime(slot.date, 'ampm', "PM")}
                              >
                                PM
                              </button>
                            </div>
                          </div>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeSlot(slot.date)}
                          >
                            <i className="bi bi-x-circle-fill"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="row">
                {/* Left Column - Date Picker */}
                <div className="col-md-6 border-end pe-4">
                  <h6 className="fw-bold mb-3">Select Dates</h6>
                  <p className="text-muted small mb-3">
                    Click dates to add them as booking slots
                  </p>
                  
                  <div className="booking-modal-calendar">
                    <DatePicker
                      inline
                      selected={currentMonth}
                      onChange={addSlot}
                      onMonthChange={(date) => setCurrentMonth(date)}
                      shouldCloseOnSelect={false}
                      calendarClassName="w-100"
                      dayClassName={(date) => {
                        const dateString = moment(date).format("YYYY-MM-DD");
                        const isSelected = slots.some(slot => slot.date === dateString);
                        return isSelected ? 'selected-date' : undefined;
                      }}
                    />
                  </div>
                </div>

                {/* Right Column - Reason, Equipment & Actions */}
                <div className="col-md-6 ps-4">
                  {/* Reason Selection */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Reason for Booking</h6>
                    <select
                      className="form-select"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    >
                      <option value="">-- Select a reason --</option>
                      <option value="training">Training Session</option>
                      <option value="practice">Practice Session</option>
                      <option value="tryout">Tryout/Trial</option>
                      <option value="event">Special Event</option>
                      <option value="meeting">Team Meeting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Equipment Request Section */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0">Equipment Request</h6>
                      <button
                        type="button"
                        className={`btn btn-sm ${showEquipmentRequest ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                        onClick={() => setShowEquipmentRequest(!showEquipmentRequest)}
                      >
                        {showEquipmentRequest ? (
                          <><i className="bi bi-x me-1"></i> Cancel Request</>
                        ) : (
                          <><i className="bi bi-plus-circle me-1"></i> Request Equipment</>
                        )}
                      </button>
                    </div>
                    
                    {showEquipmentRequest && (
                      <div className="border rounded p-3 bg-light">
                        {loadingEquipment ? (
                          <div className="text-center">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Loading equipment...</span>
                            </div>
                            <p className="text-muted small mt-2">Loading available equipment...</p>
                          </div>
                        ) : (
                          <>
                            {/* Equipment Selection */}
                            <div className="mb-3">
                              <label className="form-label small fw-bold">Select Equipment</label>
                              <select
                                className="form-select form-select-sm"
                                value={selectedEquipment}
                                onChange={(e) => setSelectedEquipment(e.target.value)}
                              >
                                <option value="">-- Select Equipment --</option>
                                {equipmentList.map(equipment => (
                                  <option key={equipment._id} value={equipment._id}>
                                    {equipment.name} (Available: {equipment.quantityAvailable})
                                  </option>
                                ))}
                              </select>
                              {selectedEquipmentDetails && (
                                <div className="mt-2 small text-muted">
                                  <span className="badge bg-info me-2">{selectedEquipmentDetails.category}</span>
                                  {selectedEquipmentDetails.description}
                                </div>
                              )}
                            </div>

                            {/* Quantity Selection */}
                            <div className="mb-3">
                              <label className="form-label small fw-bold">Quantity</label>
                              <div className="d-flex align-items-center">
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => setRequestQuantity(Math.max(1, requestQuantity - 1))}
                                  disabled={requestQuantity <= 1}
                                >
                                  <i className="bi bi-dash"></i>
                                </button>
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center mx-2"
                                  style={{ maxWidth: '80px' }}
                                  value={requestQuantity}
                                  onChange={(e) => setRequestQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                  min="1"
                                  max={selectedEquipmentDetails?.quantityAvailable || 99}
                                />
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => setRequestQuantity(requestQuantity + 1)}
                                  disabled={selectedEquipmentDetails && requestQuantity >= selectedEquipmentDetails.quantityAvailable}
                                >
                                  <i className="bi bi-plus"></i>
                                </button>
                                {selectedEquipmentDetails && (
                                  <span className="ms-2 small text-muted">
                                    Max: {selectedEquipmentDetails.quantityAvailable}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Submit Equipment Request Button */}
                            <button
                              type="button"
                              className="btn btn-info btn-sm w-100"
                              disabled={!selectedEquipment || submittingRequest}
                              onClick={submitEquipmentRequest}
                            >
                              {submittingRequest ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check-circle me-2"></i>
                                  Submit Equipment Request
                                </>
                              )}
                            </button>

                            <p className="small text-muted mt-2 mb-0">
                              <i className="bi bi-info-circle me-1"></i>
                              Equipment requests will be reviewed by exec members
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Availability Status */}
                  {available !== null && (
                    <div className={`alert ${available ? 'alert-success' : 'alert-danger'} mb-4`}>
                      <div className="d-flex align-items-center">
                        <i className={`bi ${available ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                        <div>
                          <strong>{available ? 'Available!' : 'Not Available'}</strong>
                          <div className="small">
                            {available 
                              ? 'The facility is available for all selected slots.'
                              : 'The facility is not available for some selected slots.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>
                      <strong>Instructions:</strong> Click dates on calendar to add slots. 
                      Set different times for each date as needed. You can optionally request equipment.
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={onClose}
              >
                Cancel
              </button>
              
              <button
                type="button"
                className="btn btn-warning"
                disabled={checking || slots.length === 0 || slots.some(s => !s.hour)}
                onClick={checkAvailability}
              >
                {checking ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Checking...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Check Availability
                  </>
                )}
              </button>
              
              <button
                type="button"
                className="btn btn-primary"
                disabled={available !== true || checking || slots.length === 0}
                onClick={submitBooking}
              >
                <i className="bi bi-calendar-check me-2"></i>
                Book {slots.length} Slot(s)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}