import { useEffect, useState, useMemo } from "react";
import { Spinner, Form, InputGroup, Pagination } from "react-bootstrap";
import moment from "moment";
import { 
  FiSearch, FiFilter, FiCalendar, FiClock, 
  FiMapPin, FiCheckCircle, FiXCircle, FiAlertCircle, FiActivity 
} from "react-icons/fi";

import api from "../../api/axios";
import { getSocket } from "../../socket";
import HeroBanner from "../../components/HeroBanner";

export default function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/attendance/student");
      setRecords(res.data?.records || []);
    } catch (err) {
      console.error("Attendance fetch error", err);
      setRecords([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => fetchData(true);
    socket.off("dashboard_update");
    socket.on("dashboard_update", handler);
    return () => socket.off("dashboard_update", handler);
  }, []);

  const filteredData = useMemo(() => {
    return records.filter((r) => {
      const keyword = search.toLowerCase();
      const matchesSearch = r.bookingId?.sessionTitle?.toLowerCase().includes(keyword) || 
                            r.bookingId?.facilityId?.name?.toLowerCase().includes(keyword);
      const matchesStatus = activeTab === "All" || r.status === activeTab;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, activeTab]);

  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter(r => r.status === "Present").length;
    const absent = records.filter(r => r.status === "Absent").length;
    const rate = total === 0 ? 0 : Math.round((present / total) * 100);
    return { total, present, absent, rate };
  }, [records]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 border border-success border-opacity-25"><FiCheckCircle className="me-1"/> Present</span>;
      case "Absent":
        return <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 border border-danger border-opacity-25"><FiXCircle className="me-1"/> Absent</span>;
      case "Late":
        return <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2 border border-warning border-opacity-25"><FiAlertCircle className="me-1"/> Late</span>;
      case "Injured":
        return <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2 border border-secondary border-opacity-25"><FiActivity className="me-1"/> Injured</span>;
      default:
        return <span className="badge bg-light text-muted rounded-pill px-3 py-2 border">Unknown</span>;
    }
  };

  const tabs = ["All", "Present", "Absent", "Late", "Injured"];

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      
      <HeroBanner
        title="My Attendance Record"
        subtitle="Track your participation, session history, and overall attendance rate."
      />

      <div className="row g-4 mt-2 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary me-3">
              <FiActivity size={24} />
            </div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold">Attendance Rate</p>
              <h3 className="fw-bold mb-0 text-dark">{stats.rate}%</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
            <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success me-3">
              <FiCheckCircle size={24} />
            </div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold">Total Present</p>
              <h3 className="fw-bold mb-0 text-dark">{stats.present} <span className="fs-6 fw-normal text-muted">/ {stats.total}</span></h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
            <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger me-3">
              <FiXCircle size={24} />
            </div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold">Total Absent</p>
              <h3 className="fw-bold mb-0 text-dark">{stats.absent}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
        
        <div 
          className="bg-white p-1 rounded-pill d-inline-flex border shadow-sm hide-scrollbar" 
          style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-4 fw-bold transition-all flex-shrink-0 ${
                activeTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "bg-transparent text-muted hover-dark"
              }`}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="d-flex gap-2 w-100 flex-shrink-0" style={{ maxWidth: "400px" }}>
          <InputGroup className="bg-white border rounded-pill shadow-sm overflow-hidden">
            <InputGroup.Text className="bg-transparent border-0 text-muted ps-3 pe-0">
              <FiSearch />
            </InputGroup.Text>
            <Form.Control
              className="border-0 shadow-none py-2 bg-transparent"
              placeholder="Search session or venue..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </InputGroup>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="px-4 py-3 fw-bold border-bottom-0 letter-spacing-1">Session Info</th>
                <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Date & Time</th>
                <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Status</th>
                <th className="px-4 py-3 fw-bold border-bottom-0 letter-spacing-1">Remarks</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    <Spinner animation="border" variant="primary" size="sm" className="me-2" /> Loading records...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    <div className="p-3 bg-light rounded-circle d-inline-block mb-3">
                      <FiCalendar size={24} className="opacity-50" />
                    </div>
                    <p className="mb-0 fw-bold text-dark">No attendance records found</p>
                    <small>Check back later or adjust your filters.</small>
                  </td>
                </tr>
              ) : (
                paginatedData.map((r) => (
                  <tr key={r._id}>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-light-primary text-primary rounded-3 p-2 me-3 d-none d-sm-block">
                          <FiActivity size={18} />
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{r.bookingId?.sessionTitle || "Untitled Session"}</div>
                          <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                            <FiMapPin size={12} className="me-1"/> {r.bookingId?.facilityId?.name || "Venue TBA"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <div className="fw-semibold text-dark">
                        {r.bookingId?.startAt ? moment(r.bookingId.startAt).format("DD MMM YYYY") : "-"}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                        <FiClock size={12} className="me-1"/>
                        {r.bookingId?.startAt ? moment(r.bookingId.startAt).format("HH:mm") : "-"} - {r.bookingId?.endAt ? moment(r.bookingId.endAt).format("HH:mm") : "-"}
                      </div>
                    </td>

                    <td className="py-3">
                      {getStatusBadge(r.status)}
                    </td>

                    <td className="px-4 py-3 text-muted small">
                      {r.remarks ? (
                        <span className="fst-italic">"{r.remarks}"</span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredData.length > 0 && (
          <div className="card-footer bg-white border-top p-3 px-4 d-flex flex-wrap justify-content-between align-items-center">
            <span className="text-muted small mb-2 mb-sm-0">
              Showing <span className="fw-bold text-dark">{paginatedData.length}</span> of <span className="fw-bold text-dark">{filteredData.length}</span> records
            </span>
            
            <Pagination className="mb-0 shadow-sm">
              <Pagination.Prev 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item 
                  key={i + 1} 
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)}
              />
            </Pagination>
          </div>
        )}
      </div>

      <style>{`
        .hover-dark:hover { color: #1e293b !important; }
        .letter-spacing-1 { letter-spacing: 0.5px; }
        .bg-light-primary { background-color: rgba(13, 110, 253, 0.1); }
        
        /* HIDDEN SCROLLBAR FOR MOBILE TABS */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}