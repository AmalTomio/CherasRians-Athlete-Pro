import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiMessageSquare,
  FiClock
} from "react-icons/fi";
import useAnnouncements from "../../hooks/useAnnouncements";

export default function StudentAnnouncements() {
  const { announcements } = useAnnouncements();

  // Helper to get initials for the avatar placeholder
  const getInitials = (f, l) =>
    `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="px-4 py-4">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1 text-dark" style={{ letterSpacing: "-0.5px" }}>
          Announcements
        </h2>
        <p className="text-muted">Stay updated with the latest notices from your coaches and Excos.</p>
      </div>

      <div className="row">
        {/* Centered column for better readability on large screens */}
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <FiBell className="text-primary" /> Recent Updates
              </h5>
              <span className="badge bg-light text-secondary border">
                {announcements?.length || 0}
              </span>
            </div>

            <div className="card-body p-0">
              {!announcements || announcements.length === 0 ? (
                // EMPTY STATE
                <div className="p-5 text-center text-muted">
                  <FiMessageSquare size={48} className="mb-3 opacity-25" />
                  <h5 className="fw-bold text-dark">No announcements yet</h5>
                  <p className="m-0 text-secondary">You're all caught up! Check back later for updates.</p>
                </div>
              ) : (
                // LIST OF ANNOUNCEMENTS
                <div className="list-group list-group-flush">
                  <AnimatePresence>
                    {announcements.map((a, i) => (
                      <motion.div 
                        key={a._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="list-group-item border-0 border-bottom p-4 hover-bg-light"
                      >
                        {/* Title and Date */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="fw-bold text-dark m-0 pe-3">{a.title}</h5>
                          <div className="d-flex align-items-center gap-1 text-muted bg-light px-2 py-1 rounded-pill flex-shrink-0" style={{ fontSize: "0.75rem" }}>
                            <FiClock size={12} />
                            <span>
                              {new Date(a.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Message Content */}
                        <p className="text-secondary mb-4 lh-base text-break" style={{ fontSize: "0.95rem" }}>
                          {a.content}
                        </p>

                        {/* Author Info (Footer of the card) */}
                        <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ borderColor: "#f1f5f9" }}>
                          <div className="d-flex align-items-center gap-3">
                            <div 
                              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" 
                              style={{ width: 36, height: 36, fontSize: "14px" }}
                            >
                              {getInitials(a.createdBy?.firstName, a.createdBy?.lastName)}
                            </div>
                            <div className="lh-sm">
                              <div className="fw-bold text-dark" style={{ fontSize: "0.85rem" }}>
                                {a.createdBy?.firstName} {a.createdBy?.lastName}
                              </div>
                              <div className="text-muted text-capitalize" style={{ fontSize: "0.75rem" }}>
                                {a.createdBy?.role}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>
        {`
          .hover-bg-light { transition: background-color 0.2s ease-in-out; }
          .hover-bg-light:hover { background-color: #f8f9fa; }
          .bg-primary-subtle { background-color: #e0e7ff; }
          .text-primary { color: #4338ca !important; }
        `}
      </style>
    </div>
  );
}