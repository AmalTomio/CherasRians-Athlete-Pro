import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Badge } from "react-bootstrap";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { FiActivity, FiStar, FiTrendingUp } from "react-icons/fi";

import api from "../../api/axios";
import HeroBanner from "../../components/HeroBanner";
import FiltersCard from "../../components/FiltersCard";
import { formatLabel } from "../../utils/format";

export default function Performance() {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [training, setTraining] = useState(null);

  const fetchTraining = async () => {
    try {
      const res = await api.get("/performance/student-training");
      setTraining(res.data.training);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchTraining();
      setLoading(false);
    };

    init();
  }, []);

  const filteredHistory =
    training?.history?.filter((item) => {
      const itemDate = new Date(item.date);

      if (startDate && itemDate < new Date(startDate)) {
        return false;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (itemDate > end) {
          return false;
        }
      }

      return true;
    }) || [];

  const historyChartData = filteredHistory.map((item) => ({
    date: moment(item.date).format("DD MMM"),
    rating: item.rating,
    score: item.score,
  }));

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      <style>{`
        .perf-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .perf-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .perf-tracking-wide {
          letter-spacing: 0.5px;
        }
      `}</style>

      <HeroBanner
        title="My Performance"
        subtitle="Track your match ratings, playtime, and overall progress."
      />

      <FiltersCard
        search=""
        setSearch={() => {}}
        year=""
        setYear={() => {}}
        classGroup=""
        setClassGroup={() => {}}
        sport=""
        setSport={() => {}}
        showYear={false}
        showClass={false}
        showSport={false}
        showDate={true}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onReset={() => {
          setStartDate("");
          setEndDate("");
        }}
      />
      {/* ================= TRAINING PERFORMANCE ================= */}
      <Row className="g-4 mt-2 mb-4">
        <Col md={6}>
          <div className="perf-card p-4 d-flex align-items-center gap-3 h-100">
            <div className="perf-icon-box bg-warning bg-opacity-10 text-warning">
              <FiStar size={26} />
            </div>

            <div>
              <div className="text-muted small fw-semibold text-uppercase perf-tracking-wide mb-1">
                Training Rating
              </div>

              <h3 className="fw-bolder mb-0 text-dark">
                {training?.averageRating?.toFixed(1) || "0.0"}
                <span className="fs-6 text-muted fw-normal"> / 10</span>
              </h3>
            </div>
          </div>
        </Col>

        <Col md={6}>
          <div className="perf-card p-4 d-flex align-items-center gap-3 h-100">
            <div className="perf-icon-box bg-success bg-opacity-10 text-success">
              <FiTrendingUp size={26} />
            </div>

            <div>
              <div className="text-muted small fw-semibold text-uppercase perf-tracking-wide mb-1">
                Training Score
              </div>

              <h3 className="fw-bolder mb-0 text-dark">
                {training?.score || 0}
                <span className="fs-6 text-muted fw-normal"> pts</span>
              </h3>
            </div>
          </div>
        </Col>
      </Row>

      {/* ================= COACH ASSESSMENT BREAKDOWN ================= */}
      {training?.drills && Object.keys(training.drills).length > 0 && (
        <Card className="perf-card mb-4 p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-2">
              <FiActivity className="text-primary fs-5" />
              <h5 className="fw-bold mb-0 text-dark">
                Coach Assessment Breakdown
              </h5>
            </div>
          </div>

          <div style={{ width: "100%", height: 450 }}>
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={Object.entries(training.drills).map(([name, value]) => ({
                  name: formatLabel(name),
                  score: value,
                }))}
                margin={{
                  top: 20,
                  right: 20,
                  left: 100,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis type="number" domain={[0, 10]} />

                <YAxis type="category" dataKey="name" width={180} />

                <Tooltip formatter={(value) => [`${value}/10`, "Score"]} />

                <Bar dataKey="score" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* ================= PERFORMANCE PROGRESS ================= */}
      <Card className="perf-card mb-4 p-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <FiTrendingUp className="text-primary fs-5" />
          <h5 className="fw-bold mb-0 text-dark">Performance Progress</h5>
        </div>

        {historyChartData.length === 0 ? (
          <div className="text-center py-5 text-muted">
            No assessment history available.
          </div>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={historyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="date" />

                <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                <Tooltip />

                <Bar
                  dataKey="rating"
                  fill="#2563eb"
                  name="Training Rating"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
