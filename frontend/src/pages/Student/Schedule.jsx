import React, { useEffect, useState, useMemo } from "react";
import { Badge, Spinner } from "react-bootstrap";
import moment from "moment";
import api from "../../api/axios";
import { FiCalendar, FiClock, FiMapPin, FiFileText, FiFastForward, FiRewind } from "react-icons/fi";

import HeroBanner from "../../components/HeroBanner";
import FiltersCard from "../../components/FiltersCard";
import Table from "../../components/Table";

export default function Training() {
  const [sessions, setSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming"); 

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [scheduleRes, matchRes] = await Promise.all([
        api.get("/schedules/player"),
        api.get("/matches/player"),
      ]);

      setSessions(Array.isArray(scheduleRes.data?.schedules) ? scheduleRes.data.schedules : []);
      setMatches(Array.isArray(matchRes.data?.matches) ? matchRes.data.matches : []);
    } catch (err) {
      console.error("Schedule fetch error", err);
      setSessions([]);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const combined = useMemo(() => {
    return [
      ...sessions.map((s) => ({
        ...s,
        type: "training",
        title: s.title || "Squad Training", 
      })),
      ...matches.map((m) => ({
        ...m,
        type: "match",
        sessionDate: m.matchDate,
        title: `Match vs ${m.opponent}`,
        startTime: "-",
        endTime: "-",
        venue: m.venue || "TBA",
        attendanceStatus: null,
      })),
    ];
  }, [sessions, matches]);

  const filteredData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    let filtered = combined.filter((item) => {
      const targetText = item.type === "match" ? item.opponent : item.title;
      if (search && !targetText?.toLowerCase().includes(search.toLowerCase())) return false;
      
      const itemDate = new Date(item.sessionDate);
      if (activeTab === "upcoming" && itemDate < today) return false;
      if (activeTab === "past" && itemDate >= today) return false;
      
      return true;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.sessionDate);
      const dateB = new Date(b.sessionDate);
      return activeTab === "past" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [combined, search, activeTab]);

  const getAttendanceBadge = (status) => {
    switch (status) {
      case "Present": return "success";
      case "Absent": return "danger";
      case "Late": return "warning text-dark";
      case "Injured": return "secondary";
      default: return "light text-dark border";
    }
  };

  const columns = [
    {
      key: "type",
      label: "Event Type",
      accessor: (row) => (
        <Badge 
          bg={row.type === "match" ? "primary" : "indigo"} 
          style={{ backgroundColor: row.type === "training" ? '#6366f1' : '' }} 
          className="px-3 py-2 rounded-pill text-uppercase shadow-sm fw-bold tracking-wider my-2"
        >
          {row.type}
        </Badge>
      )
    },
    {
      key: "details",
      label: "Event Details",
      accessor: (row) => (
        <div className="d-flex flex-column py-2">
          <span className="fw-bolder text-dark mb-1">{row.title}</span>
          <span className="text-muted small fw-medium d-flex align-items-center gap-1">
            <FiMapPin size={12}/> {row.type === "training" ? "Training Facility" : row.venue || "TBA"}
          </span>
        </div>
      )
    },
    {
      key: "datetime",
      label: "Date & Time",
      accessor: (row) => (
        <div className="d-flex flex-column py-2">
          <span className="fw-bold text-dark mb-1 d-flex align-items-center gap-1">
            <FiCalendar size={14} className={row.type === "match" ? "text-primary" : "text-indigo"} style={{ color: row.type === "training" ? '#6366f1' : '' }}/> 
            {moment(row.sessionDate).format("DD MMM YYYY")}
          </span>
          {row.type === "training" ? (
            <span className="text-muted small fw-medium d-flex align-items-center gap-1">
              <FiClock size={12}/> {row.startTime} - {row.endTime}
            </span>
          ) : (
            <span className="text-muted small fw-medium fst-italic">Match Time TBA</span>
          )}
        </div>
      )
    },
    {
      key: "status",
      label: "Status / Result",
      accessor: (row) => {
        if (row.type === "training") {
          return (
            <Badge bg={getAttendanceBadge(row.attendanceStatus)} className="px-3 py-2 rounded-pill shadow-sm border">
              {row.attendanceStatus || "Pending"}
            </Badge>
          );
        } else {
          if (row.status === "completed") {
            return (
              <div className="d-flex flex-column">
                <span className="fw-bolder text-dark fs-6">{row.score?.our} - {row.score?.opponent}</span>
                <span className={`small fw-bold ${row.result === 'win' ? 'text-success' : row.result === 'loss' ? 'text-danger' : 'text-warning'}`}>
                  {row.result ? row.result.toUpperCase() : "FINISHED"}
                </span>
              </div>
            );
          }
          return <Badge bg="light" text="dark" className="border shadow-sm px-3 py-2 rounded-pill">Upcoming</Badge>;
        }
      }
    }
  ];

  return (
    <div className="px-4 py-4">
      <HeroBanner 
        title="My Schedule"
        subtitle="Keep track of your upcoming training sessions and fixtures."
      />

      <div className="mb-4">
        <FiltersCard
          search={search}
          setSearch={setSearch}
          searchPlaceholder="Search events or opponents..."
          showYear={false}
          showClass={false} 
          showSport={false} 
          showStatus={false}
          showCategory={false}
          onReset={() => setSearch("")}
        />
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          {activeTab === "upcoming" ? <FiFastForward className="text-primary"/> : <FiRewind className="text-secondary"/>}
          {activeTab === "upcoming" ? "Upcoming Schedule" : "Past Schedule"}
        </h5>

        <div className="bg-light p-1 rounded-pill d-inline-flex border">
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
              activeTab === "upcoming"
                ? "bg-white text-primary shadow-sm"
                : "text-muted hover-dark"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
              activeTab === "past"
                ? "bg-white text-primary shadow-sm"
                : "text-muted hover-dark"
            }`}
            onClick={() => setActiveTab("past")}
          >
            Past Events
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        {filteredData.length === 0 && !loading ? (
           <div className="text-center py-5 text-muted">
             <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
               <FiFileText size={28} className="text-slate-400 opacity-50" />
             </div>
             <h6 className="fw-bold mb-1 text-dark">No Events Found</h6>
             <p className="mb-0 small">No schedule matches your current filters.</p>
           </div>
        ) : (
           <Table 
             columns={columns} 
             data={filteredData} 
             loading={loading} 
             itemsPerPage={10} 
           />
        )}
      </div>

      {/* Hover styling for unselected tab */}
      <style>{`
        .hover-dark:hover {
          color: #1e293b !important;
        }
      `}</style>
    </div>
  );
}