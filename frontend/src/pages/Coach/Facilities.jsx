import { useEffect, useState } from "react";
import api from "../../api/axios";
import FacilityCard from "../../components/FacilityCard";
import BookingModal from "../../components/BookingModal";

export default function FacilityList() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const fetchFacilities = async () => {
    try {
      const res = await api.get("/facilities");
      setFacilities(res.data.facilities || []);
    } catch (err) {
      console.error("Failed to fetch facilities:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      setBookingError(null);
      
      // Use the correct endpoint from your backend
      const res = await api.get("/bookings/coach");
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err.response?.status || err.message);
      setBookingError("Could not load booking history");
      // Set empty array as fallback
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    fetchBookings();
  }, []);

  const openBooking = (facility) => {
    setSelectedFacility(facility);
    setShowModal(true);
  };

  const closeBooking = () => {
    setShowModal(false);
    setSelectedFacility(null);
  };

  const handleBookingSuccess = () => {
    fetchFacilities();
    fetchBookings(); // Refresh bookings after new booking
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Calculate duration
  const getDuration = (startAt, endAt) => {
    if (!startAt || !endAt) return "N/A";
    const start = new Date(startAt);
    const end = new Date(endAt);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    if (!status) return 'secondary';
    switch(status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  // Get equipment summary
  const getEquipmentSummary = (equipmentRequests) => {
    if (!equipmentRequests || equipmentRequests.length === 0) {
      return "No equipment";
    }
    
    const totalItems = equipmentRequests.reduce((sum, eq) => sum + eq.quantity, 0);
    const types = equipmentRequests.length;
    
    if (types === 1) {
      return `${equipmentRequests[0].quantity} × ${equipmentRequests[0].equipmentName}`;
    }
    
    return `${totalItems} items (${types} types)`;
  };

  return (
    <div>
      <h2 className="mb-3">Book Facilities</h2>
      <p className="text-muted mb-4">Select a facility to create a booking request.</p>

      {/* Facilities Section */}
      <div className="mb-5">
        <div className="container-fluid">
          <div className="row g-4">
            {loading
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="col-6 col-md-4 col-lg-3 col-xl-2">
                    <div className="card p-4 placeholder-glow" style={{ height: "150px" }}>
                      <span className="placeholder col-8"></span>
                      <span className="placeholder col-6 mt-2"></span>
                      <span className="placeholder col-4 mt-2"></span>
                    </div>
                  </div>
                ))
              : facilities.map((fac) => (
                  <div key={fac._id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                    <FacilityCard facility={fac} onBook={openBooking} />
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="d-flex align-items-center my-5">
        <div className="flex-grow-1 border-top"></div>
        <div className="px-3">
          <h4 className="mb-0 text-muted">Your Booking Requests</h4>
        </div>
        <div className="flex-grow-1 border-top"></div>
      </div>

      {/* Booking Requests Section */}
      <div className="mt-4">
        {bookingError ? (
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {bookingError}
            <div className="small mt-1">
              Booking history feature is being set up. You can still make new bookings.
            </div>
          </div>
        ) : loadingBookings ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading bookings...</span>
            </div>
            <p className="mt-2 text-muted">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="bi bi-calendar-x" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
            </div>
            <h5 className="text-muted">No booking requests yet</h5>
            <p className="text-muted">Select a facility above to make your first booking request.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Facility</th>
                    <th scope="col">Date & Time</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Equipment</th>
                    <th scope="col">Reason</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                            style={{ width: '40px', height: '40px', color: 'white' }}
                          >
                            <i className="bi bi-building"></i>
                          </div>
                          <div>
                            <strong>{booking.facilityId?.name || 'Facility'}</strong>
                            <div className="small text-muted">
                              {booking.facilityId?.type || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <div><strong>{formatDate(booking.startAt)}</strong></div>
                          <div>
                            {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {getDuration(booking.startAt, booking.endAt)}
                        </span>
                      </td>
                      <td>
                        <div className="small">
                          {getEquipmentSummary(booking.equipmentRequests)}
                        </div>
                      </td>
                      <td>
                        <div className="small text-truncate" style={{ maxWidth: '150px' }} title={booking.reason}>
                          {booking.reason || 'No reason provided'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusBadgeColor(booking.status)}`}>
                          {booking.status ? 
                            booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 
                            'Unknown'
                          }
                        </span>
                        {booking.approvedAt && booking.status === 'approved' && (
                          <div className="small text-muted mt-1">
                            Approved {formatDate(booking.approvedAt)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statistics Card */}
            {bookings.length > 0 && (
              <div className="row mt-4">
                <div className="col-md-3">
                  <div className="card border-primary">
                    <div className="card-body text-center">
                      <h5 className="card-title text-primary">Total Bookings</h5>
                      <h2 className="card-text">{bookings.length}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-success">
                    <div className="card-body text-center">
                      <h5 className="card-title text-success">Approved</h5>
                      <h2 className="card-text">
                        {bookings.filter(b => b.status === 'approved').length}
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-warning">
                    <div className="card-body text-center">
                      <h5 className="card-title text-warning">Pending</h5>
                      <h2 className="card-text">
                        {bookings.filter(b => b.status === 'pending').length}
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-secondary">
                    <div className="card-body text-center">
                      <h5 className="card-title text-secondary">Cancelled/Rejected</h5>
                      <h2 className="card-text">
                        {bookings.filter(b => 
                          b.status === 'cancelled' || b.status === 'rejected'
                        ).length}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {selectedFacility && (
        <BookingModal
          facility={selectedFacility}
          show={showModal}
          onClose={closeBooking}
          onBooked={handleBookingSuccess}
        />
      )}
    </div>
  );
}