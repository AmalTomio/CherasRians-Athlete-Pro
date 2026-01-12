import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function PlayerSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/schedules/player");
      setSchedules(res.data.schedules || []);
    } catch (err) {
      console.error("Fetch player schedules error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border text-primary mb-3" />
        <div>Loading your training schedule...</div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-calendar-x display-4 mb-3"></i>
        <h6>No upcoming sessions</h6>
        <p className="small">Check back later for new schedules</p>
      </div>
    );
  }

  return (
    <div className="px-2 px-md-4">
      <h2 className="fw-bold mb-1">My Training Schedule</h2>
      <p className="text-muted mb-3">
        View you scheduled training sessions and events below
      </p>

      <div className="row g-3">
        {schedules.map((s) => {
          const date = new Date(s.sessionDate);

          return (
            <div key={s._id} className="col-12 col-md-6 col-xl-4">
              <div className="card schedule-card h-100 shadow-sm border-0">
                {/* HEADER */}
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <span className="fw-semibold text-uppercase small">
                    {s.sessionType || "Training"}
                  </span>
                  <span className="badge bg-light text-primary">
                    {s.playerCategory}
                  </span>
                </div>

                {/* BODY */}
                <div className="card-body">
                  {/* DATE */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="schedule-date-box text-center me-3">
                      <div className="fw-bold fs-5">
                        {date.getDate()}
                      </div>
                      <div className="small text-uppercase">
                        {date.toLocaleString("en-US", { month: "short" })}
                      </div>
                    </div>

                    <div>
                      <h6 className="fw-bold mb-1">{s.title}</h6>
                      <div className="text-muted small">
                        {date.toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <ul className="list-unstyled small mb-0">
                    <li className="mb-2 d-flex align-items-center">
                      <i className="bi bi-clock text-primary me-2"></i>
                      <span>
                        {s.startTime} – {s.endTime}
                      </span>
                    </li>

                    <li className="mb-2 d-flex align-items-center">
                      <i className="bi bi-geo-alt text-danger me-2"></i>
                      <span>{s.facilityId?.name || "-"}</span>
                    </li>

                    <li className="d-flex align-items-center">
                      <i className="bi bi-people text-success me-2"></i>
                      <span>{s.playerCategory}</span>
                    </li>
                  </ul>
                </div>

                {/* FOOTER */}
                <div className="card-footer bg-light d-flex justify-content-between align-items-center small">
                  <span className="text-muted">
                    Status
                  </span>
                  <span className="badge bg-success-subtle text-success">
                    Scheduled
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
