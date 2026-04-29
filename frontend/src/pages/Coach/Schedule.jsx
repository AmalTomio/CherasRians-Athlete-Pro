import React, { useState, useMemo } from "react";
import { Form, InputGroup, Dropdown, Pagination } from "react-bootstrap";
import { 
  FiCalendar, FiSearch, FiPlus, FiMoreVertical, 
  FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiFilter
} from "react-icons/fi";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";

import HeroBanner from "../../components/HeroBanner";
import { coachService } from "../../services/coachServices";

export default function Schedule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: coachService.getSchedules,
  });

  /* ================= FILTER LOGIC ================= */
  const filteredData = useMemo(() => {
    return schedules.filter(item => {
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const itemStatus = (item.status || "pending").toLowerCase();
      const matchesTab = activeTab === "All" || itemStatus === activeTab.toLowerCase();

      return matchesSearch && matchesTab;
    });
  }, [schedules, searchTerm, activeTab]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  /* ================= UI HELPERS ================= */
  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "approved":
        return <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 border border-success border-opacity-25"><FiCheckCircle className="me-1"/> Approved</span>;
      case "rejected":
        return <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 border border-danger border-opacity-25"><FiXCircle className="me-1"/> Rejected</span>;
      default:
        return <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2 border border-warning border-opacity-25"><FiClock className="me-1"/> Pending</span>;
    }
  };

  const tabs = ["All", "Pending", "Approved", "Rejected"];

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      <HeroBanner
        title="Squad Schedule"
        subtitle="Manage session requests, match fixtures, and training times."
        buttonText="Request Schedule"
        buttonIcon={FiPlus}
        onButtonClick={() => {/* Open Modal */}}
      />

      {/* HEADER CONTROLS (Pill Tabs + Search) */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mt-4 mb-3">
        
        {/* PILL TABS FROM MEDICAL LEAVE REVIEW */}
        <div className="bg-white p-1 rounded-pill d-inline-flex border shadow-sm flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
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

        {/* SEARCH BAR */}
        <div className="d-flex gap-2 w-100" style={{ maxWidth: "400px" }}>
          <InputGroup className="bg-white border rounded-pill shadow-sm overflow-hidden">
            <InputGroup.Text className="bg-transparent border-0 text-muted ps-3 pe-0">
              <FiSearch />
            </InputGroup.Text>
            <Form.Control
              className="border-0 shadow-none py-2 bg-transparent"
              placeholder="Search sessions or locations..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </InputGroup>
          <button className="btn btn-white border shadow-sm rounded-circle d-flex align-items-center justify-content-center px-3 text-muted hover-dark transition-all">
            <FiFilter />
          </button>
        </div>
      </div>

      {/* MAIN DATA CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        {/* TABLE CONTENT */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="px-4 py-3 fw-bold border-bottom-0 letter-spacing-1">Session Details</th>
                <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Date & Time</th>
                <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Type</th>
                <th className="py-3 fw-bold border-bottom-0 letter-spacing-1">Status</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="spinner-border text-primary spinner-border-sm me-2" /> Loading schedule...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="p-3 bg-light rounded-circle d-inline-block mb-3">
                      <FiCalendar size={24} className="opacity-50" />
                    </div>
                    <p className="mb-0 fw-bold text-dark">No records found</p>
                    <small>Try adjusting your search or filter.</small>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row._id} style={{ cursor: "pointer" }}>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-light-primary text-primary rounded-3 p-2 me-3 d-none d-sm-block">
                          <FiCalendar size={18} />
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{row.title || "Untitled Session"}</div>
                          <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                            <FiMapPin size={12} className="me-1"/> {row.location || "Sports Center"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="fw-semibold text-dark">{moment(row.startAt).format("DD MMM YYYY")}</div>
                      <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                        <FiClock size={12} className="me-1"/> {row.startTime} - {row.endTime}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`badge rounded-pill px-3 py-1 fw-normal ${row.type === 'Match' ? 'bg-danger text-white' : 'bg-primary text-white'}`}>
                        {row.type || 'Training'}
                      </span>
                    </td>
                    <td className="py-3">
                      {getStatusBadge(row.status)}
                    </td>
                  
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!isLoading && filteredData.length > 0 && (
          <div className="card-footer bg-white border-top p-3 px-4 d-flex flex-wrap justify-content-between align-items-center">
            <span className="text-muted small">
              Showing <span className="fw-bold text-dark">{paginatedData.length}</span> of <span className="fw-bold text-dark">{filteredData.length}</span> results
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
      
      {/* STYLES FOR TAB HOVER AND PILL SEARCH */}
      <style>{`
        .hover-dark:hover { color: #1e293b !important; }
        .letter-spacing-1 { letter-spacing: 0.5px; }
      `}</style>
    </div>
  );
}