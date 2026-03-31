import React, { useState } from "react";
import { Button, Alert } from "react-bootstrap";
import { FiDownload, FiUsers, FiActivity } from "react-icons/fi";
import api from "../../api/axios";

export default function ExcoReports() {
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState(null);

  const downloadReport = async (endpoint, prefix) => {
    setDownloading(prefix);
    setError(null);
    try {
      const res = await api.get(endpoint, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      
      const filename = `${prefix}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to download ${prefix} report. Please try again later.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1 text-dark fw-bold">Reports Export</h2>
        <p className="text-muted mb-0">Download entire system data in Excel format.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
           <div className="card shadow-sm border-0 rounded-4 bg-white h-100 p-3 text-center">
              <div className="card-body">
                 <div className="mb-3 d-inline-flex bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                    <FiUsers size={32} />
                 </div>
                 <h5 className="fw-bold text-dark">Global Attendance Report</h5>
                 <p className="text-muted small mb-4">
                    Download complete attendance records for all teams.
                 </p>
                 <Button 
                   variant="primary" 
                   className="w-100"
                   onClick={() => downloadReport("/reports/attendance", "attendance_global")}
                   disabled={downloading === "attendance_global"}
                 >
                   <FiDownload className="me-2" />
                   {downloading === "attendance_global" ? "Downloading..." : "Export Attendance"}
                 </Button>
              </div>
           </div>
        </div>

        <div className="col-md-6 col-lg-4">
           <div className="card shadow-sm border-0 rounded-4 bg-white h-100 p-3 text-center">
              <div className="card-body">
                 <div className="mb-3 d-inline-flex bg-success bg-opacity-10 text-success p-3 rounded-circle">
                    <FiActivity size={32} />
                 </div>
                 <h5 className="fw-bold text-dark">Global Match Report</h5>
                 <p className="text-muted small mb-4">
                    Download complete records of all match results and statistics.
                 </p>
                 <Button 
                   variant="success" 
                   className="w-100"
                   onClick={() => downloadReport("/reports/matches", "matches_global")}
                   disabled={downloading === "matches_global"}
                 >
                   <FiDownload className="me-2" />
                   {downloading === "matches_global" ? "Downloading..." : "Export Matches"}
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
