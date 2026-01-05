// src/components/Chart.jsx
import ReactApexChart from "react-apexcharts";

export default function Chart({ stats }) {
  if (!stats || stats.length === 0) return null;

  const labels = stats.map((s) =>
    s.sport.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );

  const series = stats.map((s) => s.count);

  const options = {
    chart: {
      type: "donut",
      width: "100%",
    },

    labels,

    colors: ["#4F46E5", "#10B981", "#F59E0B", "#EC4899", "#3B82F6"],

    legend: {
      position: "right",
      fontSize: "14px",
      markers: {
        width: 10,
        height: 10,
        radius: 50,
      },
      itemMargin: {
        vertical: 6,
      },
    },

    tooltip: {
      custom: ({ series, seriesIndex, w }) => {
        const sport = w.globals.labels[seriesIndex];
        const value = series[seriesIndex];

        return `
          <div style="padding:8px 12px;font-size:14px">
            <strong>${sport}</strong><br/>
            ${value} students
          </div>
        `;
      },
    },

    dataLabels: {
      enabled: false,
    },

    plotOptions: {
      pie: {
        donut: {
          size: "65%",
        },
      },
    },

    responsive: [
      {
        breakpoint: 1450,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            fontSize: "13px",
          },
        },
      },
    ],
  };

  return (
    <div className="chart-wrapper">
      <h5 className="text-center mb-3">Students Per Sport</h5>

      <div className="chart-inner">
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={280}
        />
      </div>
    </div>
  );
}
