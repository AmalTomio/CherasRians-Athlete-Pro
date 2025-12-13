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
    },

    labels,

    colors: [
      "#4F46E5", // Football
      "#10B981", // Volleyball
      "#F59E0B", // Sepak Takraw
      "#EC4899", // Badminton
      "#3B82F6", // Netball
    ],

    legend: {
      position: "right",
      fontSize: "14px",
      markers: {
        width: 10,
        height: 10,
        radius: 50,
      },
      itemMargin: {
        vertical: 8,
      },
    },

    tooltip: {
      custom: ({ series, seriesIndex, w }) => {
        const sport = w.globals.labels[seriesIndex];
        const value = series[seriesIndex];

        return `
      <div style="
        padding: 8px 12px;
        font-size: 14px;
      ">
        <strong>${sport}</strong><br/>
        ${value} students
      </div>
    `;
      },
    },

    dataLabels: {
      enabled: false, // match Chart.js UX
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
        breakpoint: 768,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div
      style={{
        width: "100%",
        height: "320px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h5 className="text-center mb-3">Students Per Sport</h5>

      <div style={{ width: "70%", height: "100%" }}>
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height="100%"
        />
      </div>
    </div>
  );
}
