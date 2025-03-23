import React, { useState, useEffect } from "react";
import {
  PAGEVIEW_CARBON_FACTOR,
  PROMPT_CARBON_FACTOR,
  UnifiedStatsTracker,
} from "../utils/unifiedStatsTracker";

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

  const getTreeOffset = (grams: number): number => {
    return Math.ceil(grams / 150);
  };

  // Compare to everyday activities for context
  const getComparison = (grams: number): string => {
    return `You need to plant ${getTreeOffset(grams)} tree${
      getTreeOffset(grams) !== 1 ? "s" : ""
    } to offset this.`;
  };

  // Calculate monthly estimate (today's footprint × 30 days)
  const monthlyFootprint = carbonData.totalFootprint * 30;
  const monthlyPromptFootprint = carbonData.promptFootprint * 30;
  const monthlyPageViewFootprint = carbonData.pageViewFootprint * 30;

  return (
    <div className="carbon-footprint mt-4 pt-4">
      <h3 className="text-sm font-medium mb-2">Carbon Footprint Estimate</h3>

      {/* Daily Footprint Panel */}
      <div className="bg-emerald-50 p-3 rounded-lg">
        <div className="text-center mb-1">
          <span className="text-xs uppercase font-medium text-emerald-700">
            Today's Net Usage
          </span>
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-emerald-700">
            {formatFootprint(carbonData.totalFootprint)}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Daily ChatGPT usage:</span>
          <span className="font-medium">
            {formatFootprint(carbonData.promptFootprint)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Daily web browsing:</span>
          <span className="font-medium">
            {formatFootprint(carbonData.pageViewFootprint)}
          </span>
        </div>
        {/* Monthly Footprint Panel */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-center mb-1">
            <span className="text-xs uppercase font-medium text-blue-700">
              Monthly Net Projection
            </span>
          </div>
          <div className="text-center">
            <span className="text-lg font-bold text-blue-700">
              {formatFootprint(monthlyFootprint)}
            </span>
          </div>
          <div className="text-xs text-blue-600 mt-1 text-center">
            {getComparison(monthlyFootprint)}
          </div>
        </div>
        <div className="w-full flex justify-center items-center">
          <button
            className="px-4 py-2 bg-emerald-50 border-2 shadow-2xs hover:shadow transition-all border-emerald-800/20 font-bold text-emerald-800 text-xl rounded-lg w-4/5 cursor-pointer"
            onClick={() => {
              window.open(
                "https://onetreeplanted.org/products/trees",
                "_blank"
              );
              setCarbonData((prev) => {
                return {
                  ...prev,
                  totalFootprint: 0,
                  promptFootprint: 0,
                  pageViewFootprint: 0,
                };
              });
            }}
          >
            Plant {getTreeOffset(monthlyFootprint)} Tree(s)
          </button>
        </div>
        <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
          <span>Monthly ChatGPT usage:</span>
          <span className="font-medium">
            {formatFootprint(monthlyPromptFootprint)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Monthly web browsing:</span>
          <span className="font-medium">
            {formatFootprint(monthlyPageViewFootprint)}
          </span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Based on estimates: {PROMPT_CARBON_FACTOR}g CO₂e per prompt,{" "}
        {PAGEVIEW_CARBON_FACTOR}g CO₂e per page view
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
