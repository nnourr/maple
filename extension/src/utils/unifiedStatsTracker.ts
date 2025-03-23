import { TokenDatabase, TokenStats } from "./db";
import { PageViewTracker } from "./pageViewTracker";

// Define the structure for the unified data
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

interface UnifiedStatsData {
  history: UnifiedRecord[];
  lastRecordTime: number;
}

const STORAGE_KEY = "unified_stats_data";
const RECORD_INTERVAL = 60000; // 60 seconds in milliseconds
const MAX_HISTORY_LENGTH = 1000; // Maximum number of history entries to keep

// Carbon footprint constants (in grams)
const PROMPT_CARBON_FACTOR = 4.32;
const PAGEVIEW_CARBON_FACTOR = 0.359;

export const UnifiedStatsTracker = {
  async getData(): Promise<UnifiedStatsData> {
    console.log("[UnifiedStatsTracker] Getting data from chrome.storage.local");
    try {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          if (chrome.runtime.lastError) {
            console.error(
              "[UnifiedStatsTracker] Storage get error:",
              chrome.runtime.lastError
            );
          }

          if (result && result[STORAGE_KEY]) {
            console.log(
              "[UnifiedStatsTracker] Retrieved data:",
              result[STORAGE_KEY]
            );
            resolve(result[STORAGE_KEY]);
          } else {
            // Return default data if nothing exists
            const initialData = {
              history: [],
              lastRecordTime: 0,
            };
            console.log(
              "[UnifiedStatsTracker] No data found, returning initial data"
            );
            resolve(initialData);
          }
        });
      });
    } catch (error) {
      console.error(
        "[UnifiedStatsTracker] Error reading data from storage:",
        error
      );
      // Return default data on error
      return {
        history: [],
        lastRecordTime: 0,
      };
    }
  },

  async saveData(data: UnifiedStatsData): Promise<void> {
    console.log("[UnifiedStatsTracker] Saving data to chrome.storage.local");
    try {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
          if (chrome.runtime.lastError) {
            console.error(
              "[UnifiedStatsTracker] Storage save error:",
              chrome.runtime.lastError
            );
          }
          console.log("[UnifiedStatsTracker] Data saved successfully");
          resolve();
        });
      });
    } catch (error) {
      console.error(
        "[UnifiedStatsTracker] Error saving data to storage:",
        error
      );
    }
  },

  async recordUnifiedStats(): Promise<UnifiedRecord | null> {
    console.log("[UnifiedStatsTracker] Recording unified stats");
    try {
      const now = Date.now();
      const data = await this.getData();

      // Check if it's time to add a new record (60-second interval)
      if (now - data.lastRecordTime < RECORD_INTERVAL) {
        console.log("[UnifiedStatsTracker] Skipping record, interval not met");
        return null;
      }

      // Get latest token stats
      const tokenStats = (await TokenDatabase.getLatestStats()) || {
        timestamp: now,
        prompts: 0,
        cachedMessages: [],
      };

      // Get latest page view stats
      const pageViewData = await PageViewTracker.getData();

      // Calculate carbon footprint
      const promptFootprint = tokenStats.prompts * PROMPT_CARBON_FACTOR;
      const pageViewFootprint =
        pageViewData.totalViews * PAGEVIEW_CARBON_FACTOR;
      const totalFootprint = promptFootprint + pageViewFootprint;

      // Create unified record
      const unifiedRecord: UnifiedRecord = {
        timestamp: now,
        tokens: {
          prompts: tokenStats.prompts,
        },
        pageViews: {
          totalViews: pageViewData.totalViews,
        },
        carbonFootprint: {
          promptFootprint,
          pageViewFootprint,
          totalFootprint,
        },
      };

      // Add to history
      data.history.push(unifiedRecord);
      data.lastRecordTime = now;

      // Trim history if it gets too long
      if (data.history.length > MAX_HISTORY_LENGTH) {
        data.history = data.history.slice(-MAX_HISTORY_LENGTH);
      }

      // Save updated data
      await this.saveData(data);

      return unifiedRecord;
    } catch (error) {
      console.error(
        "[UnifiedStatsTracker] Error recording unified stats:",
        error
      );
      return null;
    }
  },

  async getHistory(): Promise<UnifiedRecord[]> {
    try {
      const data = await this.getData();
      return data.history || [];
    } catch (error) {
      console.error("[UnifiedStatsTracker] Error getting history:", error);
      return [];
    }
  },

  async reset(): Promise<void> {
    console.log("[UnifiedStatsTracker] Resetting unified stats data");
    const initialData: UnifiedStatsData = {
      history: [],
      lastRecordTime: 0,
    };
    await this.saveData(initialData);
  },

  // Calculate current carbon footprint
  async getCurrentCarbonFootprint(): Promise<{
    promptFootprint: number;
    pageViewFootprint: number;
    totalFootprint: number;
  }> {
    try {
      // Get latest token stats
      const tokenStats = (await TokenDatabase.getLatestStats()) || {
        prompts: 0,
      };

      // Get latest page view stats
      const pageViewData = await PageViewTracker.getData();

      // Calculate carbon footprint
      const promptFootprint = tokenStats.prompts * PROMPT_CARBON_FACTOR;
      const pageViewFootprint =
        pageViewData.totalViews * PAGEVIEW_CARBON_FACTOR;
      const totalFootprint = promptFootprint + pageViewFootprint;

      return {
        promptFootprint,
        pageViewFootprint,
        totalFootprint,
      };
    } catch (error) {
      console.error(
        "[UnifiedStatsTracker] Error calculating carbon footprint:",
        error
      );
      return {
        promptFootprint: 0,
        pageViewFootprint: 0,
        totalFootprint: 0,
      };
    }
  },
};
