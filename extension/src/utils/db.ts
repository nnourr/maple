export interface TokenStats {
  timestamp: number;
  prompts: number;
  cachedMessages: string[];
}

// Key for the token stats history in chrome.storage.local
const TOKEN_STATS_KEY = "token-stats-history";

export class TokenDatabase {
  // Save stats with timestamp to the stats history array
  static async saveStats(stats: TokenStats): Promise<void> {
    // Ensure the stats has a timestamp if not already provided
    if (!stats.timestamp) {
      stats.timestamp = Date.now();
    }

    try {
      // Get existing history
      const history = await this.getAllStats();

      // Add new stats entry
      history.push(stats);

      // Store updated history
      await chrome.storage.local.set({ [TOKEN_STATS_KEY]: history });
      console.log("[DB] Stats saved successfully", stats);
    } catch (error) {
      console.error("[DB] Error saving stats", error);
      throw error;
    }
  }

  // Get the latest (most recent) stats entry
  static async getLatestStats(): Promise<TokenStats | null> {
    try {
      const history = await this.getAllStats();

      if (history.length === 0) {
        console.log("[DB] No stats found");
        return null;
      }

      // Sort by timestamp and get the most recent
      history.sort((a, b) => b.timestamp - a.timestamp);
      const latestStats = history[0];

      console.log("[DB] Latest stats retrieved", latestStats);
      return latestStats;
    } catch (error) {
      console.error("[DB] Error getting latest stats", error);
      throw error;
    }
  }

  // Get all stats history
  static async getAllStats(): Promise<TokenStats[]> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([TOKEN_STATS_KEY], (result) => {
        if (chrome.runtime.lastError) {
          console.error(
            "[DB] Error getting stats history",
            chrome.runtime.lastError
          );
          reject(chrome.runtime.lastError);
          return;
        }

        const history: TokenStats[] = result[TOKEN_STATS_KEY] || [];
        console.log("[DB] Stats history retrieved", history.length, "entries");
        resolve(history);
      });
    });
  }

  // Clear all stats history
  static async clearStats(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove([TOKEN_STATS_KEY], () => {
        if (chrome.runtime.lastError) {
          console.error("[DB] Error clearing stats", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }

        console.log("[DB] Stats cleared successfully");
        resolve();
      });
    });
  }

  // Utility method to limit the history size
  static async pruneHistory(maxEntries: number = 1000): Promise<void> {
    try {
      let history = await this.getAllStats();

      if (history.length > maxEntries) {
        console.log(
          `[DB] Pruning history from ${history.length} to ${maxEntries} entries`
        );

        // Sort by timestamp (newest first) and keep only the latest maxEntries
        history.sort((a, b) => b.timestamp - a.timestamp);
        history = history.slice(0, maxEntries);

        // Save the pruned history
        await chrome.storage.local.set({ [TOKEN_STATS_KEY]: history });
      }
    } catch (error) {
      console.error("[DB] Error pruning history", error);
    }
  }
}
