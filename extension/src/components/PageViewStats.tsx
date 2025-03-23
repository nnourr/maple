import React, { useState, useEffect } from "react";
import { PageViewTracker } from "../utils/pageViewTracker";

interface PageViewRecord {
  timestamp: number;
  count: number;
}

interface PageViewData {
  totalViews: number;
  history: PageViewRecord[];
}

const PageViewStats: React.FC = () => {
  const [viewData, setViewData] = useState<PageViewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const loadPageViewData = async () => {
    setLoading(true);

    // Try to get data directly from PageViewTracker
    try {
      const data = await PageViewTracker.getData();
      setViewData(data);
      setLoading(false);
    } catch (error) {
      console.error("[PageViewStats] Error retrieving data directly:", error);
      setLoading(false);
    }
  };

  const resetPageViews = async () => {
    // Reset data directly through PageViewTracker
    try {
      await PageViewTracker.reset();
      await loadPageViewData();
    } catch (error) {
      console.error("[PageViewStats] Error resetting data:", error);
    }

    // Also notify any active content scripts about the reset
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "RESET_PAGE_VIEWS" });
      }
    });
  };

  useEffect(() => {
    loadPageViewData();
  }, []);

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="text-center py-2 text-gray-500">Loading view data...</div>
    );
  }

  if (!viewData) {
    return (
      <div className="text-center py-2 text-gray-500">
        Unable to load page view data.
      </div>
    );
  }

  // Display total views prominently
  return (
    <div className="page-view-stats mt-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-medium mb-2">Page View Statistics</h3>

      {/* Show total views in a more prominent way */}
      <div className="bg-green-50 p-3 rounded-lg mb-3 text-center">
        <div className="text-2xl font-bold text-green-700">
          {viewData?.totalViews || 0}
        </div>
        <div className="text-xs text-green-600">Total Pages Viewed</div>
      </div>

      {/* History toggle button */}
      {viewData.history?.length > 0 && (
        <div className="mb-3">
          <button
            className="text-xs text-blue-500 hover:underline"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Hide" : "Show"} View History
          </button>

          {/* History panel */}
          {showHistory && (
            <div className="mt-2 text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
              <div className="text-xs text-gray-600 mb-1">
                Page view history (recorded every 60 seconds):
              </div>
              {viewData.history.length === 0 ? (
                <div className="text-gray-500">No history available yet</div>
              ) : (
                <div className="space-y-1">
                  {viewData.history.slice(-10).map((record, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{formatDate(record.timestamp)}</span>
                      <span className="font-medium">{record.count} views</span>
                    </div>
                  ))}
                  {viewData.history.length > 10 && (
                    <div className="text-gray-500 text-center pt-1">
                      + {viewData.history.length - 10} more entries
                    </div>
                  )}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                The complete history data is available for creating charts
              </div>
            </div>
          )}
        </div>
      )}

      <button
        className="w-full py-1 mt-2 bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 rounded"
        onClick={resetPageViews}
      >
        Reset Views
      </button>
    </div>
  );
};

export default PageViewStats;
