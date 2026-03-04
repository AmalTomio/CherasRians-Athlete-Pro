// src/components/Chart.jsx
import ReactApexChart from "react-apexcharts";

export default function Chart({ stats, type = 'donut', title = "", tooltipLabel = "items", colors = ["#4F46E5", "#10B981", "#F59E0B", "#EC4899", "#3B82F6"] }) {
  if (!stats) return null;

  const series = stats.map((s) => s.count);
  const isAllZero = series.length > 0 ? series.every((v) => v === 0) : true;

  if (stats.length === 0 || isAllZero) {
    return (
      <div className="chart-wrapper h-100 d-flex flex-column align-items-center justify-content-center">
        {title && <h5 className="text-center mb-0 fw-bold pb-3" style={{ color: "#334155", letterSpacing: "-0.5px" }}>{title}</h5>}
        <div className="text-muted d-flex flex-column align-items-center flex-grow-1 justify-content-center">
          <i className="bi bi-inbox fs-1 mb-2 opacity-50"></i>
          <p className="mb-0 fw-medium">No data available</p>
        </div>
      </div>
    );
  }

  const labels = stats.map((s) => {
    const raw = s.sport || s.status || s.period || '';
    return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  });

  const isSingleDimensional = ["donut", "pie", "radialBar"].includes(type);
  const formattedSeries = isSingleDimensional ? series : [{ name: tooltipLabel, data: series }];

  const tooltipConfig = {
    theme: 'light',
    y: {
      formatter: (val) => {
        return `${val} ${tooltipLabel}`;
      }
    }
  };

  const options = {
    chart: {
      type,
      width: "100%",
    },

    labels,

    colors,

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

    tooltip: tooltipConfig,

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
      {title && <h5 className="text-center mb-0 fw-bold" style={{ color: "#334155", letterSpacing: "-0.5px" }}>{title}</h5>}

      <div className="chart-inner">
        <ReactApexChart
          options={options}
          series={formattedSeries}
          type={type}
          height={280}
        />
      </div>
    </div>
  );
}
