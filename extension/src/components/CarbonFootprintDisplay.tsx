import React, { useState, useEffect } from "react";
import { UnifiedStatsTracker } from "../utils/unifiedStatsTracker";

interface CarbonFootprint {
  promptFootprint: number;
  pageViewFootprint: number;
  totalFootprint: number;
}

const CarbonFootprintDisplay: React.FC = () => {
  const [carbonData, setCarbonData] = useState<CarbonFootprint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadCarbonData = async () => {
    setLoading(true);
    try {
      const footprint = await UnifiedStatsTracker.getCurrentCarbonFootprint();
      setCarbonData(footprint);
    } catch (error) {
      console.error("[CarbonFootprint] Error loading carbon data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarbonData();

    // Refresh data every minute
    const intervalId = setInterval(() => {
      loadCarbonData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-2 text-gray-500">
        Calculating carbon footprint...
      </div>
    );
  }

  if (!carbonData) {
    return (
      <div className="text-center py-2 text-gray-500">
        Unable to calculate carbon footprint.
      </div>
    );
  }

  const formatFootprint = (grams: number): string => {
    if (grams < 1000) {
      return `${grams.toFixed(2)} g`;
    } else {
      return `${(grams / 1000).toFixed(2)} kg`;
    }
  };

  // Compare to everyday activities for context
  const getComparison = (grams: number): string => {
    if (grams < 10) {
      return "Less than sending 1 email with attachment";
    } else if (grams < 50) {
      return "Equivalent to charging a smartphone";
    } else if (grams < 200) {
      return "Like boiling water for 1 cup of tea";
    } else if (grams < 1000) {
      return "Similar to driving a car for 1 km";
    } else {
      return "Equivalent to cooking a meal";
    }
  };

  return (
    <div className="carbon-footprint mt-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-medium mb-2">Carbon Footprint Estimate</h3>

      <div className="bg-emerald-50 p-3 rounded-lg mb-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-emerald-700">
            Today's Digital Footprint:
          </span>
          <span className="text-lg font-bold text-emerald-700">
            {formatFootprint(carbonData.totalFootprint)}
          </span>
        </div>
        <div className="text-xs text-emerald-600 mt-1 italic">
          {getComparison(carbonData.totalFootprint)}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>From ChatGPT prompts:</span>
          <span className="font-medium">
            {formatFootprint(carbonData.promptFootprint)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>From web browsing:</span>
          <span className="font-medium">
            {formatFootprint(carbonData.pageViewFootprint)}
          </span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Based on estimates: 4.32g CO₂e per prompt, 1.76g CO₂e per page view
      </div>

      <button
        className="w-full py-1 mt-2 bg-gray-100 text-gray-600 text-xs hover:bg-gray-200 rounded"
        onClick={loadCarbonData}
      >
        Refresh Carbon Data
      </button>
    </div>
  );
};

export default CarbonFootprintDisplay;
