import React, { useState, useEffect } from "react";
import { UnifiedStatsTracker } from "../utils/unifiedStatsTracker";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface UnifiedRecord {
  timestamp: number;
  tokens: {
    prompts: number;
  };
  pageViews: {
    totalViews: number;
  };
  carbonFootprint: {
    promptFootprint: number;
    pageViewFootprint: number;
    totalFootprint: number;
  };
}

const UnifiedStatsChart: React.FC = () => {
  const [statsHistory, setStatsHistory] = useState<UnifiedRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadStatsHistory = async () => {
    setLoading(true);
    try {
      const history = await UnifiedStatsTracker.getHistory();
      setStatsHistory(history);
    } catch (error) {
      console.error("[UnifiedStatsChart] Error loading stats history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatsHistory();

    // Set up refresh interval
    const intervalId = setInterval(() => {
      loadStatsHistory();
    }, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading stats history...</div>;
  }

  if (!statsHistory.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No stats history available yet. Stats are recorded every 60 seconds.
      </div>
    );
  }

  // Format timestamps for all charts
  const timeLabels = statsHistory.map((record) =>
    new Date(record.timestamp).toLocaleTimeString()
  );

  // Common chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // Hide legend since each chart only has one dataset
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  // Page Views Chart
  const pageViewsData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Page Views",
        data: statsHistory.map((record) => record.pageViews.totalViews),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        fill: true,
      },
    ],
  };

  // Token Prompts Chart
  const promptsData = {
    labels: timeLabels,
    datasets: [
      {
        label: "ChatGPT Prompts",
        data: statsHistory.map((record) => record.tokens.prompts),
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        fill: true,
      },
    ],
  };

  // Carbon Footprint Chart
  const carbonData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Carbon Footprint (g)",
        data: statsHistory.map(
          (record) => record.carbonFootprint?.totalFootprint || 0
        ),
        borderColor: "rgb(76, 175, 80)",
        backgroundColor: "rgba(76, 175, 80, 0.5)",
        fill: true,
      },
    ],
  };

  return (
    <div className="unified-stats-chart mt-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-medium mb-4">Usage Statistics Over Time</h3>

      {/* Carbon Footprint Chart */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-600 mb-1">
          Carbon Footprint (g)
        </h4>
        <div className="h-32 bg-white p-2 rounded-md shadow-sm">
          <Line options={commonOptions} data={carbonData} />
        </div>
      </div>

      {/* Page Views Chart */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-600 mb-1">Page Views</h4>
        <div className="h-32 bg-white p-2 rounded-md shadow-sm">
          <Line options={commonOptions} data={pageViewsData} />
        </div>
      </div>

      {/* Token Prompts Chart */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-600 mb-1">
          ChatGPT Prompts
        </h4>
        <div className="h-32 bg-white p-2 rounded-md shadow-sm">
          <Line options={commonOptions} data={promptsData} />
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2 text-center">
        Data recorded every 60 seconds. Showing last {statsHistory.length}{" "}
        entries.
      </div>

      <button
        className="w-full py-1 mt-3 bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 rounded"
        onClick={loadStatsHistory}
      >
        Refresh Charts
      </button>
    </div>
  );
};

export default UnifiedStatsChart;
