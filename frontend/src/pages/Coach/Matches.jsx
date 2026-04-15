import React, { useEffect, useState, useMemo } from "react";
import { Form, Button, Modal, Badge, Row, Col } from "react-bootstrap";
import moment from "moment";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";
import { FiPlus, FiEdit3, FiFileText, FiMapPin, FiCalendar } from "react-icons/fi";

import HeroBanner from "../../components/HeroBanner";
import FiltersCard from "../../components/FiltersCard";
import Table from "../../components/Table";

export default function Matches() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [matches, setMatches] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null); 
  const [search, setSearch] = useState("");

  const initialForm = { opponent: "", venue: "", matchDate: "", category: "U-15", lineupId: "" };
  const [form, setForm] = useState(initialForm);
  const [score, setScore] = useState({ our: "", opponent: "" });

  useEffect(() => {
    fetchMatches();
    fetchLineups();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get("/matches/coach");
      setMatches(res.data.matches || []);
    } catch {
      errorAlert("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const fetchLineups = async () => {
    try {
      const res = await api.get("/team-lineup/all", { params: { sport: user.sport } });
      setLineups(res.data.lineups || []);
    } catch (err) {
      setLineups([]);
    }
  };

  const filteredLineups = lineups.filter((l) => l.category === form.category);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => m.opponent?.toLowerCase().includes(search.toLowerCase()));
  }, [matches, search]);

  const handleCreate = async () => {
    if (!form.lineupId || !form.opponent || !form.venue || !form.matchDate) {
      return errorAlert("Please complete all fields.");
    }
    try {
      await api.post("/matches", form);
      successAlert("Match schedule created");
      setForm(initialForm);
      setShowCreate(false);
      fetchMatches();
    } catch {
      errorAlert("Failed to create match");
    }
  };

  const handleSaveResult = async () => {
    try {
      await api.post(`/matches/result/${selected._id}`, {
        ourScore: Number(score.our),
        opponentScore: Number(score.opponent),
      });
      successAlert("Match result updated");
      setSelected(null);
      setScore({ our: "", opponent: "" });
      fetchMatches();
    } catch {
      errorAlert("Failed to update result");
    }
  };

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
      key: "details",
      label: "Match Details",
      accessor: (row) => (
        <div className="d-flex flex-column py-2">
          <span className="fw-bolder text-dark mb-1">{row.opponent}</span>
          <span className="text-muted small fw-medium d-flex align-items-center gap-1">
            <FiMapPin size={12}/> {row.venue || "TBA"}
          </span>
        </div>
      )
    },
    {
      key: "date",
      label: "Date & Squad",
      accessor: (row) => (
        <div className="d-flex flex-column py-2">
          <span className="fw-bold text-dark mb-1 d-flex align-items-center gap-1">
            <FiCalendar size={14} className="text-primary"/> {moment(row.matchDate).format("DD MMM YYYY")}
          </span>
          <span className="text-muted small fw-medium">{row.category} Squad</span>
        </div>
      )
    },
    {
      key: "score",
      label: "Score",
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
    },
    {
      key: "action",
      label: "Action",
      accessor: (row) => (
        row.status !== "completed" ? (
          <Button 
            variant="light" 
            size="sm" 
            className="rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 text-primary border shadow-sm"
            onClick={() => setSelected(row)}
          >
            <FiEdit3 /> Log Result
          </Button>
        ) : (
          <span className="text-muted small fst-italic">Completed</span>
        )
      )
    }
  ];

  return (
    <div className="px-4 py-4">
      <HeroBanner 
        title="Match Management"
        subtitle="Schedule upcoming fixtures and log final results."
        buttonText="Create Match"
        buttonIcon={FiPlus}
        onButtonClick={() => setShowCreate(true)}
      />

      <FiltersCard
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search opponent..."
        showYear={false}
        showClass={false} 
        showSport={false} 
        showCategory={false}
        showStatus={false}
        onReset={() => setSearch("")}
      />

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        {filteredMatches.length === 0 && !loading ? (
           <div className="text-center py-5 text-muted">
             <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
               <FiFileText size={28} className="text-slate-400 opacity-50" />
             </div>
             <h6 className="fw-bold mb-1 text-dark">No Matches Scheduled</h6>
             <p className="mb-0 small">Create a new match to get started.</p>
           </div>
        ) : (
           <Table columns={columns} data={filteredMatches} loading={loading} itemsPerPage={10} />
        )}
      </div>

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bolder">Schedule Fixture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-12">
              <Form.Label className="small fw-bold text-muted text-uppercase">Opponent Team</Form.Label>
              <Form.Control className="bg-light border-0 py-2 shadow-none" value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} />
            </div>
            <div className="col-12">
              <Form.Label className="small fw-bold text-muted text-uppercase">Venue</Form.Label>
              <Form.Control className="bg-light border-0 py-2 shadow-none" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>
            <div className="col-md-6">
              <Form.Label className="small fw-bold text-muted text-uppercase">Match Date</Form.Label>
              <Form.Control type="date" className="bg-light border-0 py-2 shadow-none text-secondary" value={form.matchDate} onChange={(e) => setForm({ ...form, matchDate: e.target.value })} />
            </div>
            <div className="col-md-6">
              <Form.Label className="small fw-bold text-muted text-uppercase">Squad Category</Form.Label>
              <Form.Select className="bg-light border-0 py-2 shadow-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, lineupId: "" })}>
                <option value="U-15">U-15 Squad</option>
                <option value="U-18">U-18 Squad</option>
              </Form.Select>
            </div>
            <div className="col-12">
              <Form.Label className="small fw-bold text-muted text-uppercase">Starting Lineup</Form.Label>
              <Form.Select className="bg-light border-0 py-2 shadow-none" value={form.lineupId} onChange={(e) => setForm({ ...form, lineupId: e.target.value })}>
                <option value="">Select Pre-configured Lineup...</option>
                {filteredLineups.map((l) => (
                  <option key={l._id} value={l._id}>{l.category} Lineup ({l.sport})</option>
                ))}
              </Form.Select>
              {filteredLineups.length === 0 && <span className="small text-danger mt-1 d-block">No lineups found for this category.</span>}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="white" className="border shadow-sm rounded-pill fw-bold px-4" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button variant="primary" className="shadow-sm rounded-pill fw-bold px-4 border-0" onClick={handleCreate}>Schedule Match</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!selected} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bolder">Log Final Score</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-4">Entering result for match against <strong>{selected?.opponent}</strong>.</p>
          <Row className="g-3">
            <Col xs={6}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Our Score</Form.Label>
              <Form.Control type="number" min="0" className="bg-light border-0 py-3 text-center fs-4 fw-bold shadow-none" value={score.our} onChange={(e) => setScore({ ...score, our: e.target.value })} />
            </Col>
            <Col xs={6}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Opponent</Form.Label>
              <Form.Control type="number" min="0" className="bg-light border-0 py-3 text-center fs-4 fw-bold shadow-none" value={score.opponent} onChange={(e) => setScore({ ...score, opponent: e.target.value })} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button variant="white" className="border shadow-sm rounded-pill fw-bold px-4" onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="success" className="shadow-sm rounded-pill fw-bold px-4 border-0" onClick={handleSaveResult}>Save Result</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}