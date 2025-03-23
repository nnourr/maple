import { TokenDatabase, TokenStats } from "./utils/db";

// Track which tabs have our content scripts running
const activeTabsWithScript = new Set<number>();
const pageviewTabsWithScript = new Set<number>();

// Initialize the database when the extension starts
async function initializeStorage() {
  console.log("[background] Initializing storage");
  try {
    // Check if we have any existing stats
    const latestStats = await TokenDatabase.getLatestStats();
    if (!latestStats) {
      console.log(
        "[background] No existing stats found, initializing with empty stats"
      );
      // Initialize with empty stats
      const initialStats: TokenStats = {
        timestamp: Date.now(),
        prompts: 0,
        cachedMessages: [],
      };
      await TokenDatabase.saveStats(initialStats);
    } else {
      console.log("[background] Found existing stats", latestStats);
    }

    // Prune history to prevent excessive storage use
    await TokenDatabase.pruneHistory();
  } catch (error) {
    console.error("[background] Error initializing storage", error);
  }
}

// Function to inject content script into a tab
function injectContentScript(tabId: number) {
  console.log(`[background] Injecting content script into tab ${tabId}`);

  // Verify the tab is still a ChatGPT tab before injecting
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error(
        `[background] Error getting tab ${tabId}:`,
        chrome.runtime.lastError
      );
      return;
    }

    if (tab.url?.includes("chatgpt.com")) {
      chrome.scripting.executeScript(
        {
          target: { tabId },
          files: ["chatgpt.js"],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              `[background] Injection error:`,
              chrome.runtime.lastError
            );
          } else {
            console.log(
              `[background] Successfully injected script into tab ${tabId}`
            );
            activeTabsWithScript.add(tabId);

            // Set a flag in storage that this tab has the script
            chrome.storage.local.set({ [`tab_${tabId}_has_script`]: true });
          }
        }
      );
    }
  });
}

// Track page navigation even across different ChatGPT pages
chrome.webNavigation?.onCompleted.addListener((details) => {
  // Only track main frame navigation (not iframes)
  if (details.frameId === 0) {
    console.log(`[background] Navigation completed: ${details.url}`);

    // If it's a ChatGPT page and we have content script injected
    if (
      details.url.includes("chatgpt.com") &&
      activeTabsWithScript.has(details.tabId)
    ) {
      // Notify content script to track a page view
      chrome.tabs
        .sendMessage(details.tabId, {
          type: "TRACK_PAGE_VIEW",
        })
        .catch(() => {
          // If sending message fails, the content script might not be ready
          // Reinjecting the content script will handle the view tracking
          injectContentScript(details.tabId);
        });
    }
  }
});

// Monitor tab updates to inject script into relevant pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(`[background] Tab ${tabId} updated:`, changeInfo.status);

  // Only act when the page is fully loaded
  if (changeInfo.status === "complete") {
    console.log(`[background] Page loaded in tab ${tabId}:`, tab.url);

    // Check if we've already injected a script into this tab
    if (!activeTabsWithScript.has(tabId)) {
      injectContentScript(tabId);
    }
  }
});

// Listen for script registration messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONTENT_SCRIPT_LOADED" && sender.tab?.id) {
    console.log(
      `[background] Content script registered in tab ${sender.tab.id}`
    );
    activeTabsWithScript.add(sender.tab.id);
    sendResponse({ success: true });
  }

  // Track pageview script loading separately
  if (message.type === "PAGEVIEW_SCRIPT_LOADED" && sender.tab?.id) {
    console.log(
      `[background] Pageview script registered in tab ${sender.tab.id}`
    );
    pageviewTabsWithScript.add(sender.tab.id);
    sendResponse({ success: true });
  }

  // Ping-pong to check if content script is still active
  if (message.type === "CONTENT_SCRIPT_PING") {
    sendResponse({ type: "BACKGROUND_PONG" });
  }

  return true;
});

// When a tab is closed, remove it from our tracking
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log(`[background] Tab ${tabId} closed, removing from active tabs`);
  activeTabsWithScript.delete(tabId);
  pageviewTabsWithScript.delete(tabId);
  chrome.storage.local.remove(`tab_${tabId}_has_script`);
});

// Handle installation and updates
chrome.runtime.onInstalled.addListener(() => {
  console.log("[background] onInstalled event fired");
  // Initialize the storage
  initializeStorage();

  // Inject the content script into any existing ChatGPT tabs
  chrome.tabs.query({ url: "https://chatgpt.com/*" }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        injectContentScript(tab.id);
      }
    });
  });
});
