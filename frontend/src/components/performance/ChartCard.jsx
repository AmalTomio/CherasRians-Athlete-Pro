import React from "react";
import Chart from "react-apexcharts";

export default function ChartCard({ title, options, series, type = "bar", height = 300 }) {
  return (
    <div className="card shadow-sm border-0 rounded-4" style={{ background: "#ffffff" }}>
      <div className="card-body">
        <h5 className="card-title fw-semibold text-dark mb-4">{title}</h5>
        <div className="chart-wrapper">
          <Chart options={options} series={series} type={type} height={height} width="100%" />
        </div>
      </div>
    </div>
  );
}
