import { useEffect, useState, useMemo } from "react";
import { Pagination, Form, InputGroup, Button } from "react-bootstrap";
import { 
  FiMapPin, FiClock, FiBox, FiCheckCircle, 
  FiXCircle, FiAlertCircle, FiSearch, FiCalendar, 
  FiActivity, FiBookmark, FiLayers
} from "react-icons/fi";

import api from "../../api/axios";
import BookingModal from "../../components/BookingModal";
import { capitalizeFirst } from "../../utils/format";
import HeroBanner from "../../components/HeroBanner";

export default function FacilityList() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Table Controls for Bookings
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  /* ================= FETCH DATA ================= */
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
      const res = await api.get("/bookings/coach");
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err.response?.status || err.message);
      setBookingError("Could not load booking history");
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    fetchBookings();
  }, []);

  /* ================= HANDLERS ================= */
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
    fetchBookings();
  };

  /* ================= FILTER & STATS ================= */
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const searchMatch = 
        b.facilityId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const status = (b.status || "pending").toLowerCase();
      const mappedStatus = status === "cancelled" ? "rejected" : status;
      const tabMatch = activeTab === "All" || mappedStatus === activeTab.toLowerCase();
      
      return searchMatch && tabMatch;
    });
  }, [bookings, searchTerm, activeTab]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      approved: bookings.filter((b) => b.status === "approved").length,
      pending: bookings.filter((b) => b.status === "pending").length,
      rejected: bookings.filter((b) => b.status === "rejected" || b.status === "cancelled").length,
    };
  }, [bookings]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage]);

  /* ================= FORMATTERS ================= */
  const getDuration = (startAt, endAt) => {
    if (!startAt || !endAt) return "N/A";
    const diffMins = Math.floor((new Date(endAt) - new Date(startAt)) / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getEquipmentSummary = (equipmentRequests) => {
    if (!equipmentRequests?.length) return "No equipment";
    const totalItems = equipmentRequests.reduce((sum, eq) => sum + eq.quantity, 0);
    return equipmentRequests.length === 1 
      ? `${equipmentRequests[0].quantity} × ${equipmentRequests[0].equipmentName}` 
      : `${totalItems} items (${equipmentRequests.length} types)`;
  };

  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "approved": return <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 border border-success border-opacity-25"><FiCheckCircle className="me-1"/> Approved</span>;
      case "rejected": 
      case "cancelled": return <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 border border-danger border-opacity-25"><FiXCircle className="me-1"/> {capitalizeFirst(s)}</span>;
      default: return <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2 border border-warning border-opacity-25"><FiAlertCircle className="me-1"/> Pending</span>;
    }
  };

  const tabs = ["All", "Pending", "Approved", "Rejected"];

  /* ================= UI ================= */
  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      <HeroBanner 
        title="Facility Bookings"
        subtitle="Reserve sports facilities and manage your squad's active booking requests."
      />

      {/* 1. AVAILABLE FACILITIES TABLE */}
      <div className="mt-4 mb-5">
        <h6 className="fw-bold text-muted text-uppercase letter-spacing-1 mb-3">Available Facilities</h6>
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small text-uppercase">
                <tr>
                  <th className="px-4 py-3 fw-bold border-bottom-0 letter-spacing-1">Facility Name</th>
                  <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Category</th>
                  <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Status</th>
                  <th className="px-4 py-3 fw-bold border-bottom-0 text-end letter-spacing-1">Action</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      <div className="spinner-border text-primary spinner-border-sm me-2" /> Loading facilities...
                    </td>
                  </tr>
                ) : facilities.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      <div className="p-3 bg-light rounded-circle d-inline-block mb-3"><FiMapPin size={24} className="opacity-50" /></div>
                      <p className="mb-0 fw-bold text-dark">No facilities found</p>
                    </td>
                  </tr>
                ) : (
                  facilities.map((fac) => (
                    <tr key={fac._id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-light-primary text-primary rounded-3 p-2 me-3">
                            <FiMapPin size={18} />
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{fac.name}</div>
                            <div className="text-muted small text-truncate" style={{ maxWidth: '250px' }}>
                              {fac.description || "General facility"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-dark small fw-semibold d-flex align-items-center">
                          <FiLayers className="me-2 text-muted" /> {capitalizeFirst(fac.type || "General")}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 border border-success border-opacity-25 fw-normal">
                          Available
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="rounded-pill px-4 fw-bold shadow-sm d-inline-flex align-items-center"
                          onClick={() => openBooking(fac)}
                        >
                          <FiBookmark className="me-2" /> Book Now
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <hr className="my-5 opacity-25" />

      {/* 2. KPI STATS */}
      <h6 className="fw-bold text-muted text-uppercase letter-spacing-1 mb-3">Your Requests Overview</h6>
      <div className="row g-4 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary me-3 d-none d-xl-block"><FiActivity size={24} /></div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold letter-spacing-1">Total</p>
              <h3 className="fw-bold mb-0 text-dark">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
            <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success me-3 d-none d-xl-block"><FiCheckCircle size={24} /></div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold letter-spacing-1">Approved</p>
              <h3 className="fw-bold mb-0 text-dark">{stats.approved}</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
            <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning me-3 d-none d-xl-block"><FiAlertCircle size={24} /></div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold letter-spacing-1">Pending</p>
              <h3 className="fw-bold mb-0 text-dark">{stats.pending}</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
            <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger me-3 d-none d-xl-block"><FiXCircle size={24} /></div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold letter-spacing-1">Rejected</p>
              <h3 className="fw-bold mb-0 text-dark">{stats.rejected}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABLE CONTROLS */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
        <div className="bg-white p-1 rounded-pill d-inline-flex border shadow-sm flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
                activeTab === tab ? "bg-primary text-white shadow-sm" : "bg-transparent text-muted hover-dark"
              }`}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="d-flex w-100" style={{ maxWidth: "400px" }}>
          <InputGroup className="bg-white border rounded-pill shadow-sm overflow-hidden">
            <InputGroup.Text className="bg-transparent border-0 text-muted ps-3 pe-0"><FiSearch /></InputGroup.Text>
            <Form.Control
              className="border-0 shadow-none py-2 bg-transparent"
              placeholder="Search facility or reason..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </InputGroup>
        </div>
      </div>

      {/* 4. BOOKINGS DATA TABLE */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        {bookingError && (
          <div className="alert alert-warning m-3 border-0 rounded-3 d-flex align-items-center">
            <FiAlertCircle className="me-2" size={20} />
            <div>
              <strong>Notice:</strong> {bookingError}. You can still make new bookings.
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="px-4 py-3 fw-bold border-bottom-0 letter-spacing-1">Facility</th>
                <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Schedule</th>
                <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Equipment / Reason</th>
                <th className="px-4 py-3 fw-bold border-bottom-0 letter-spacing-1">Status</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loadingBookings ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    <div className="spinner-border text-primary spinner-border-sm me-2" /> Loading history...
                  </td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    <div className="p-3 bg-light rounded-circle d-inline-block mb-3"><FiCalendar size={24} className="opacity-50" /></div>
                    <p className="mb-0 fw-bold text-dark">No booking requests found</p>
                    <small>Select a facility above to create your first reservation.</small>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-light-primary text-primary rounded-3 p-2 me-3 d-none d-sm-block">
                          <FiMapPin size={18} />
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{b.facilityId?.name || "Unknown Facility"}</div>
                          <div className="text-muted small">{b.facilityId?.type || "General"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="fw-semibold text-dark">
                        {b.startAt ? new Date(b.startAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                      </div>
                      <div className="text-muted small d-flex align-items-center">
                        <FiClock size={12} className="me-1"/> 
                        {b.startAt ? new Date(b.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""} 
                        <span className="mx-1">•</span> 
                        <span className="fw-bold text-primary">{getDuration(b.startAt, b.endAt)}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-dark small fw-semibold mb-1 d-flex align-items-center">
                        <FiBox size={12} className="me-1 text-muted"/> 
                        {getEquipmentSummary(b.equipmentRequests)}
                      </div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }} title={b.reason}>
                        {b.reason ? capitalizeFirst(b.reason) : <span className="fst-italic opacity-50">No reason provided</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(b.status)}
                      {b.approvedAt && b.status === "approved" && (
                        <div className="small text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                          Approved on {new Date(b.approvedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loadingBookings && filteredBookings.length > 0 && (
          <div className="card-footer bg-white border-top p-3 px-4 d-flex flex-wrap justify-content-between align-items-center">
            <span className="text-muted small">
              Showing <span className="fw-bold text-dark">{paginatedBookings.length}</span> of <span className="fw-bold text-dark">{filteredBookings.length}</span> requests
            </span>
            <Pagination className="mb-0 shadow-sm">
              <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} />
            </Pagination>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedFacility && (
        <BookingModal facility={selectedFacility} show={showModal} onClose={closeBooking} onBooked={handleBookingSuccess} />
      )}

      {/* LOCAL STYLES */}
      <style>{`
        .hover-dark:hover { color: #1e293b !important; }
        .letter-spacing-1 { letter-spacing: 0.5px; }
        .bg-light-primary { background-color: rgba(13, 110, 253, 0.1); }
      `}</style>
    </div>
  );
}