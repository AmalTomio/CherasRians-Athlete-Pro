// src/pages/Exco/ExcoDashboard.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import Chart from "../../components/Chart";

export default function ExcoDashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/exco/stats/sports");
      setStats(res.data.stats || []);
    } catch (err) {
      console.error("Failed to load sport stats:", err);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="mb-1">Exco Dashboard</h2>
      <p className="text-muted mb-4">
        Overview of students assigned to each sport.
      </p>

      <div className="container-fluid">
        <div className="row g-4">
          <div className="col-12 col-xl-6">
            <div className="card p-4 h-100">
              <Chart stats={stats} />
            </div>
          </div>

          {/* placeholder widget */}
          <div className="col-12 col-md-6">
            <div className="card p-4 h-100 d-flex align-items-center justify-content-center">
              <h5 className="text-muted">More widgets coming soon…</h5>
            </div>
          </div>
        </div>

        <div className="row g-4 mt-1">
          <div className="col-12 col-md-6">
            <div className="card p-4 h-100">
              <h5>Student Status Overview</h5>
              <p className="text-muted">Widget coming soon…</p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card p-4 h-100">
              <h5>Upcoming Events</h5>
              <p className="text-muted">Widget coming soon…</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
