// src/components/performance/ChartCard.jsx
import React from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

/**
 * Recharts Wrapper for Performance Charts
 * * @param {Array} data - e.g. [{ name: "Jan", value: 10 }]
 * @param {String} type - "bar" or "line"
 * @param {String} xAxisKey - Key in your data object for X Axis
 * @param {String} yAxisKey - Key in your data object for the Bar/Line 
 */
export default function ChartCard({ 
  title, 
  data = [], 
  type = "bar", 
  height = 300, 
  xAxisKey = "name", 
  yAxisKey = "value",
  color = "#3b82f6" 
}) {
  return (
    <div className="card shadow-sm border-0 rounded-4" style={{ background: "#ffffff" }}>
      <div className="card-body">
        <h5 className="card-title fw-semibold text-dark mb-4">{title}</h5>
        <div className="chart-wrapper" style={{ height: height, width: "100%" }}>
<div style={{ width: "100%", height: 350, minHeight: 300 }}>

          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey={yAxisKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey={yAxisKey} stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}