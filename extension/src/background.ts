import { TokenStats } from "../src/components/Popup";

// Track which tabs have our content script running
const activeTabsWithScript = new Set<number>();

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
          files: ["contentScript.js"],
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

// Monitor tab updates to inject script into ChatGPT pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(`[background] Tab ${tabId} updated:`, changeInfo.status);

  // Only act when the page is fully loaded
  if (changeInfo.status === "complete" && tab.url?.includes("chatgpt.com")) {
    console.log(`[background] ChatGPT page loaded in tab ${tabId}`);

    // Check if we've already injected a script into this tab
    if (!activeTabsWithScript.has(tabId)) {
      injectContentScript(tabId);
    }
  }
});

// Listen for script registration messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONTENT_SCRIPT_LOADED" && sender.tab?.id) {
    console.log(
      `[background] Content script registered in tab ${sender.tab.id}`
    );
    activeTabsWithScript.add(sender.tab.id);
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
  chrome.storage.local.remove(`tab_${tabId}_has_script`);
});

// Handle installation and updates
chrome.runtime.onInstalled.addListener(() => {
  console.log("[background] onInstalled event fired");
  // Initialize token stats if not already set
  chrome.storage.local.get(["tokenStats"], (result) => {
    console.log("[background] storage.local.get callback", result);
    if (!result.tokenStats) {
      const stringInitialStats: TokenStats = {
        prompts: 0,
        cachedMessages: [],
      };
      console.log("[background] Initializing stats", stringInitialStats);
      chrome.storage.local.set({
        tokenStats: stringInitialStats,
      });
    }
  });

  // Inject the content script into any existing ChatGPT tabs
  chrome.tabs.query({ url: "https://chatgpt.com/*" }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        injectContentScript(tab.id);
      }
    });
  });
});
