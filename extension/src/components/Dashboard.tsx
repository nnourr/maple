import React, { useEffect, useState } from "react";
import { TokenDatabase, TokenStats } from "../utils/db";
import UsageChart from "./UsageChart";

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [statsHistory, setStatsHistory] = useState<TokenStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load latest stats
        const latestStats = await TokenDatabase.getLatestStats();
        if (latestStats) {
          setStats(latestStats);
        }

        // Load all stats for history
        const allStats = await TokenDatabase.getAllStats();
        setStatsHistory(allStats);
        console.log("[Dashboard] Loaded data successfully " + allStats);
      } catch (error) {
        console.error("[Dashboard] Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleReset = async () => {
    try {
      await TokenDatabase.clearStats();

      // Create a new initial stats entry
      const resetStats: TokenStats = {
        timestamp: Date.now(),
        prompts: 0,
        cachedMessages: [],
      };

      await TokenDatabase.saveStats(resetStats);

      // Update state
      setStats(resetStats);
      setStatsHistory([resetStats]);

      console.log("[Dashboard] Reset counters successfully");
    } catch (error) {
      console.error("[Dashboard] Error resetting counters:", error);
    }
  };

  // Format the timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        ChatGPT Usage Dashboard
      </h2>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700">
          Current Stats
        </h3>

        {stats ? (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Prompts:</span>
              <span className="font-medium">
                {stats.prompts.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">
                {formatTimestamp(stats.timestamp)}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Carbon Footprint:</span>
              <span className="font-medium">Coming soon</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No data available</p>
        )}

        <button
          onClick={handleReset}
          className="mt-6 w-full py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors"
        >
          Reset Counters
        </button>
      </div>

      <h3 className="text-lg font-medium mb-2 text-gray-700">
        Usage Over Time
      </h3>
      <UsageChart statsHistory={statsHistory} />

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Data is collected every 30 seconds during active ChatGPT sessions</p>
      </div>
    </div>
  );
};
