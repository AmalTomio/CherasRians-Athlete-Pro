// src/components/Chart.jsx
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Chart({ stats }) {
  if (!stats || stats.length === 0) return null;

  const labels = stats.map((s) =>
    s.sport.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
  const values = stats.map((s) => s.count);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#4F46E5", // Football
          "#10B981", // Volleyball
          "#F59E0B", // Sepak Takraw
          "#EC4899", // Badminton
          "#3B82F6", // Netball
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 

    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 14, 
          },
          padding: 18,
          usePointStyle: true, 
          pointStyle: "circle",
        },
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            const sport = context.label;
            return `Click legend to hide ${sport}`;
          },
        },
      },
    },

    layout: {
      padding: 10,
    },
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
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
