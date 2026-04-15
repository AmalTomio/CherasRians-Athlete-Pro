import React, { useEffect, useState } from "react";
import { Badge } from "react-bootstrap";
import moment from "moment";
import api from "../../api/axios";
import { getSocket } from "../../socket";
import { FiFileText } from "react-icons/fi";

// Centralized Components
import HeroBanner from "../../components/HeroBanner";
import FiltersCard from "../../components/FiltersCard";
import Table from "../../components/Table";

export default function ExcoMatches() {
  const [matches, setMatches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("");
  const [category, setCategory] = useState("");

  /* ================= FETCH ================= */
  const fetchMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/matches/all");
      const data = res.data.matches || [];
      setMatches(data);
      setFiltered(data);
    } catch (err) {
      console.error("Fetch matches error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  /* ================= REALTIME ================= */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => fetchMatches(true);
    socket.on("dashboard_update", handler);
    return () => socket.off("dashboard_update", handler);
  }, []);

  /* ================= FILTER LOGIC ================= */
  useEffect(() => {
    let data = [...matches];

    if (search) {
      data = data.filter((m) =>
        m.opponent?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sport) {
      data = data.filter((m) => m.sport === sport);
    }
    if (category) {
      data = data.filter((m) => m.category === category);
    }

    setFiltered(data);
  }, [search, sport, category, matches]);

  /* ================= TABLE COLUMNS ================= */
  const getResultBadge = (result, status) => {
    if (status !== "completed") return <Badge bg="light" text="dark" className="border shadow-sm px-3 py-2 rounded-pill">Upcoming</Badge>;
    switch (result?.toLowerCase()) {
      case "win": return <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">Win</Badge>;
      case "loss": return <Badge bg="danger" className="px-3 py-2 rounded-pill shadow-sm">Loss</Badge>;
      case "draw": return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill shadow-sm">Draw</Badge>;
      default: return <Badge bg="secondary" className="px-3 py-2 rounded-pill">-</Badge>;
    }
  };

  const columns = [
    {
      key: "opponent",
      label: "Opponent",
      accessor: (row) => <span className="fw-bolder text-dark d-block py-2">{row.opponent}</span>
    },
    {
      key: "sport",
      label: "Sport & Category",
      accessor: (row) => (
        <div className="d-flex flex-column py-2">
          <span className="fw-bold text-dark mb-1 text-capitalize">{row.sport?.replace('_', ' ')}</span>
          <span className="text-muted small fw-medium">{row.category} Squad</span>
        </div>
      )
    },
    {
      key: "date",
      label: "Match Date",
      accessor: (row) => (
        <span className="fw-medium text-secondary py-2">
          {moment(row.matchDate).format("DD MMM YYYY")}
        </span>
      )
    },
    {
      key: "coach",
      label: "Head Coach",
      accessor: (row) => (
        <span className="fw-medium text-dark py-2">
          {row.coachId?.firstName} {row.coachId?.lastName}
        </span>
      )
    },
    {
      key: "score",
      label: "Score (Our - Opp)",
      accessor: (row) => (
        <span className="fw-bold text-dark fs-6 py-2">
          {row.score ? `${row.score.our} - ${row.score.opponent}` : "-"}
        </span>
      )
    },
    {
      key: "result",
      label: "Result",
      accessor: (row) => getResultBadge(row.result, row.status)
    }
  ];

  /* ================= UI ================= */
  return (
    <div className="px-4 py-4">
      <HeroBanner 
        title="Matches Overview"
        subtitle="Global audit of all match schedules and results across the academy."
      />

      <div className="mb-4">
        <FiltersCard
          search={search}
          setSearch={setSearch}
          searchPlaceholder="Search by opponent..."
          showSport={true}
          sport={sport}
          setSport={setSport}
          showCategory={true}
          category={category}
          setCategory={setCategory}
          showYear={false}
          showClass={false} 
          showStatus={false}
          onReset={() => {
            setSearch("");
            setSport("");
            setCategory("");
          }}
        />
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        {filtered.length === 0 && !loading ? (
           <div className="text-center py-5 text-muted">
             <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
               <FiFileText size={28} className="text-slate-400 opacity-50" />
             </div>
             <h6 className="fw-bold mb-1 text-dark">No Matches Found</h6>
             <p className="mb-0 small">No match records match your current filters.</p>
           </div>
        ) : (
           <Table columns={columns} data={filtered} loading={loading} itemsPerPage={10} />
        )}
      </div>
    </div>
  );
}