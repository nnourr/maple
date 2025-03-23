interface PageViewRecord {
  timestamp: number; // milliseconds since epoch
  count: number;
}

interface PageViewData {
  totalViews: number;
  history: PageViewRecord[]; // Array to store view counts with timestamps
  lastRecordTime: number; // To track when we last recorded a history entry
}

const STORAGE_KEY = "chatgpt_token_counter_pageview_data";
const RECORD_INTERVAL = 60000; // 60 seconds in milliseconds
const MAX_HISTORY_LENGTH = 1000; // Maximum number of history entries to keep

export const PageViewTracker = {
  async getData(): Promise<PageViewData> {
    console.log("[PageViewTracker] Getting data from chrome.storage.local");
    try {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          if (chrome.runtime.lastError) {
            console.error(
              "[PageViewTracker] Storage get error:",
              chrome.runtime.lastError
            );
          }

          if (result && result[STORAGE_KEY]) {
            console.log(
              "[PageViewTracker] Retrieved data:",
              result[STORAGE_KEY]
            );
            resolve(result[STORAGE_KEY]);
          } else {
            // Return default data if nothing exists
            const initialData = {
              totalViews: 0,
              history: [],
              lastRecordTime: 0,
            };
            console.log(
              "[PageViewTracker] No data found, returning initial data"
            );
            resolve(initialData);
          }
        });
      });
    } catch (error) {
      console.error(
        "[PageViewTracker] Error reading data from storage:",
        error
      );
      // Return default data on error
      return {
        totalViews: 0,
        history: [],
        lastRecordTime: 0,
      };
    }
  },

  async saveData(data: PageViewData): Promise<void> {
    console.log("[PageViewTracker] Saving data to chrome.storage.local");
    try {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
          if (chrome.runtime.lastError) {
            console.error(
              "[PageViewTracker] Storage save error:",
              chrome.runtime.lastError
            );
          }
          console.log("[PageViewTracker] Data saved successfully");
          resolve();
        });
      });
    } catch (error) {
      console.error("[PageViewTracker] Error saving data to storage:", error);
    }
  },

  async recordView(): Promise<PageViewData> {
    console.log("[PageViewTracker] Recording page view");
    try {
      const data = await this.getData();
      const now = Date.now();

      // Increment total views
      data.totalViews += 1;

      // Check if it's time to add a new history record (60-second interval)
      if (now - data.lastRecordTime >= RECORD_INTERVAL) {
        // Add a new history entry
        data.history.push({
          timestamp: now,
          count: data.totalViews,
        });

        // Update the last record time
        data.lastRecordTime = now;

        // Trim history if it gets too long
        if (data.history.length > MAX_HISTORY_LENGTH) {
          data.history = data.history.slice(-MAX_HISTORY_LENGTH);
        }
      }

      // Save updated data
      await this.saveData(data);

      return data;
    } catch (error) {
      console.error("[PageViewTracker] Error recording view:", error);
      const fallbackData = {
        totalViews: 1, // At least count this view
        history: [
          {
            timestamp: Date.now(),
            count: 1,
          },
        ],
        lastRecordTime: Date.now(),
      };
      return fallbackData;
    }
  },

  async getHistory(): Promise<PageViewRecord[]> {
    try {
      const data = await this.getData();
      return data.history || [];
    } catch (error) {
      console.error("[PageViewTracker] Error getting history:", error);
      return [];
    }
  },

  async reset(): Promise<void> {
    console.log("[PageViewTracker] Resetting page view data");
    const initialData: PageViewData = {
      totalViews: 0,
      history: [],
      lastRecordTime: 0,
    };
    await this.saveData(initialData);
  },
};
