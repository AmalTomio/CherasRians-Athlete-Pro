// src/components/Chart.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Chart({
  stats,
  type = "donut",
  title = "",
  tooltipLabel = "items",
  colors = ["#4F46E5", "#10B981", "#F59E0B", "#EC4899", "#3B82F6"],
}) {
  if (!stats) return null;

  const isAllZero = stats.length > 0 ? stats.every((v) => v.count === 0) : true;

  if (stats.length === 0 || isAllZero) {
    return (
      <div className="chart-wrapper h-100 d-flex flex-column align-items-center justify-content-center">
        {title && (
          <h5 className="text-center mb-0 fw-bold pb-3" style={{ color: "#334155", letterSpacing: "-0.5px" }}>
            {title}
          </h5>
        )}
        <div className="text-muted d-flex flex-column align-items-center flex-grow-1 justify-content-center">
          <i className="bi bi-inbox fs-1 mb-2 opacity-50"></i>
          <p className="mb-0 fw-medium">No data available</p>
        </div>
      </div>
    );
  }

  // Normalize data for Recharts
  const data = stats.map((s) => {
    const raw = s.sport || s.status || s.period || "";
    const name = raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { name, value: s.count };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border shadow-sm rounded p-2 small">
          <span className="fw-semibold">{payload[0].name}: </span>
          <span>{`${payload[0].value} ${tooltipLabel}`}</span>
        </div>
      );
    }
    return null;
  };

  const renderChartType = () => {
    switch (type) {
      case "donut":
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={type === "donut" ? "55%" : 0}
              outerRadius="80%"
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "14px" }} />
          </PieChart>
        );

      case "bar":
        return (
          <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="chart-wrapper d-flex flex-column h-100">
      {title && (
        <h5 className="text-center mb-3 fw-bold" style={{ color: "#334155", letterSpacing: "-0.5px" }}>
          {title}
        </h5>
      )}
      <div className="chart-inner flex-grow-1" style={{ minHeight: "280px" }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChartType()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}