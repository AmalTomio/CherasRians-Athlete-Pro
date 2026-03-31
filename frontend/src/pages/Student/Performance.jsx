import React, { useState, useEffect } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { FiStar, FiClock, FiActivity, FiTarget } from "react-icons/fi";
import KPICard from "../../components/performance/KPICard";
import ChartCard from "../../components/performance/ChartCard";
import api from "../../api/axios";

export default function StudentPerformance() {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
         setError("User not found.");
         setLoading(false);
         return;
      }
      const user = JSON.parse(userStr);
      
      const res = await api.get(`/performance/player/${user._id}`);
      setPerformanceData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load performance metrics.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-1 text-dark fw-bold">My Performance</h2>
        <p className="text-muted mb-0">Review your personal statistics and growth.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
           <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : performanceData ? (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-3">
               <KPICard 
                 title="Total Matches" 
                 value={performanceData.metrics?.matchesPlayed || 0} 
                 icon={<FiActivity size={20} />} 
                 color="primary"
               />
            </div>
            <div className="col-md-3">
               <KPICard 
                 title="Avg Rating" 
                 value={Number(performanceData.metrics?.averageRating || 0).toFixed(1)} 
                 icon={<FiStar size={20} />} 
                 color="warning"
               />
            </div>
            <div className="col-md-3">
               <KPICard 
                 title="Total Mins Played" 
                 value={performanceData.metrics?.totalMinutesPlayed || 0} 
                 icon={<FiClock size={20} />} 
                 color="info"
               />
            </div>
            <div className="col-md-3">
               <KPICard 
                 title="Overall Score" 
                 value={Number(performanceData.metrics?.score || 0).toFixed(0)} 
                 icon={<FiTarget size={20} />} 
                 color="success"
               />
            </div>
          </div>

          {performanceData.metrics?.stats && Object.keys(performanceData.metrics.stats).length > 0 && (
            <div className="row">
               <div className="col-lg-6">
                 <ChartCard 
                   title="Your Specific Stats"
                   type="bar"
                   options={{
                     chart: { toolbar: { show: false } },
                     plotOptions: { bar: { borderRadius: 4, horizontal: true } },
                     dataLabels: { enabled: true },
                     xaxis: { categories: Object.keys(performanceData.metrics.stats).map(k => k.replace("_", " ").toUpperCase()) },
                     colors: ['#28a745']
                   }}
                   series={[
                     { name: "Total", data: Object.values(performanceData.metrics.stats) }
                   ]}
                 />
               </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-5 bg-white rounded-3 shadow-sm border-0 text-muted">
           No performance records found.
        </div>
      )}
    </div>
  );
}
