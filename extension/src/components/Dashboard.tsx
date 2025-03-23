import React, { useEffect, useState } from "react";
import { TokenDatabase, TokenStats } from "../utils/db";
import UsageChart from "./UsageChart";
import UnifiedStatsChart from "./UnifiedStatsChart";
import CarbonFootprintDisplay from "./CarbonFootprintDisplay";

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
      <CarbonFootprintDisplay />
      <UnifiedStatsChart />
    </div>
  );
};
