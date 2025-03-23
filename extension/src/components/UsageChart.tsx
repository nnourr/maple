import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TokenStats } from "../utils/db";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UsageChartProps {
  statsHistory: TokenStats[];
}

const UsageChart: React.FC<UsageChartProps> = ({ statsHistory }) => {
  // Process data for chart
  const processedData = React.useMemo(() => {
    if (!statsHistory || statsHistory.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Prompts",
            data: [],
            borderColor: "#0e813e",
            backgroundColor: "rgba(14, 129, 62, 0.2)",
            tension: 0.3,
          },
        ],
      };
    }

    // Sort data by timestamp
    const sortedStats = [...statsHistory].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    // Format dates for labels
    const labels = sortedStats.map((stat) => {
      const date = new Date(stat.timestamp);
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    });

    // Extract prompt counts
    const data = sortedStats.map((stat) => stat.prompts);

    return {
      labels,
      datasets: [
        {
          label: "Prompts",
          data,
          borderColor: "#0e813e",
          backgroundColor: "rgba(14, 129, 62, 0.1)",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [statsHistory]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0, // Only show integers
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Prompts Over Time",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            return `Prompts: ${context.parsed.y}`;
          },
        },
      },
    },
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-4 mt-4"
      style={{ height: "300px" }}
    >
      {statsHistory.length > 0 ? (
        <Line options={options} data={processedData} />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No usage data available yet
        </div>
      )}
    </div>
  );
};

export default UsageChart;
