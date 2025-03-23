import React from "react";
import UnifiedStatsChart from "./UnifiedStatsChart";
import CarbonFootprintDisplay from "./CarbonFootprintDisplay";

export const Dashboard: React.FC = () => {
  return (
    <div className="p-6 mx-auto bg-white rounded-4xl border border-gray-200 mt-8">
      <CarbonFootprintDisplay />
      <UnifiedStatsChart />
    </div>
  );
};
