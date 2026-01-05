import { useEffect, useState } from "react";
import api from "../../api/axios";
import CoachCard from "../../components/exco/CoachCard";
import FiltersCard from "../../components/FiltersCard";

export default function Coaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("");
  const [status, setStatus] = useState("");

  const fetchCoaches = async () => {
    try {
      const res = await api.get("/exco/coaches", {
        headers: { "Cache-Control": "no-cache" },
      });
      setCoaches(res.data.coaches || []);
    } catch (err) {
      console.error("Failed to load coaches", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const handleCoachUpdated = (updatedCoach) => {
    setCoaches((prev) =>
      prev.map((c) => (c._id === updatedCoach._id ? updatedCoach : c))
    );
  };

  const filteredCoaches = coaches.filter((c) => {
    const nameMatch = `${c.firstName} ${c.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const sportMatch = sport ? c.sport === sport : true;

    const statusMatch =
      status === "active"
        ? c.isActive
        : status === "retired"
        ? !c.isActive
        : true;

    return nameMatch && sportMatch && statusMatch;
  });

  if (loading) {
    return <div className="text-center py-5">Loading coaches...</div>;
  }

  return (
    <div>
      <h2 className="mb-1">Coaches Management</h2>
      <p className="text-muted mb-4">Overview Coach.</p>

      <FiltersCard
        search={search}
        setSearch={setSearch}
        sport={sport}
        setSport={setSport}
        status={status}
        setStatus={setStatus}
        showYear={false}
        showClass={false}
        showSport={true}
        showStatus={true}
        searchPlaceholder="Search coach name..."
        onReset={() => {
          setSearch("");
          setSport("");
          setStatus("");
        }}
      />

      {/* ✅ SINGLE SOURCE OF TRUTH */}
      <div className="row g-4">
        {filteredCoaches.map((coach) => (
          <div key={coach._id} className="col-md-4">
            <CoachCard coach={coach} onUpdated={handleCoachUpdated} />
          </div>
        ))}
      </div>
    </div>
  );
}
