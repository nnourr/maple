import React from "react";

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <h2 className="text-base font-medium mb-2">Dashboard</h2>

      <div className="bg-white rounded p-3 shadow-sm mb-4">
        <div className="flex justify-between py-1">
          <span>Token Usage:</span>
          <span>TODO</span>
        </div>

        <div className="flex justify-between py-1 mt-1 pt-1 border-t border-gray-200 font-bold">
          <span>Carbon Footprint:</span>
          <span>TODO</span>
        </div>
      </div>

      <button
        className="w-full py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600"
        onClick={() => {
          console.log("[Dashboard] Reset button clicked");
        }}
      >
        Reset Counters
      </button>
    </div>
  );
};
