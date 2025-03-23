import { PageViewTracker } from "../utils/pageViewTracker";

// Global settings
const VERSION = "1.0.0";
const DEBUG = true; // Enable logging for debugging

// Log with prefix for easier debugging
function log(...args: any[]) {
  if (DEBUG) {
    console.log("[PageView]", ...args);
  }
}

// Initialize and register with background
function initialize() {
  log("Initializing pageview tracking", VERSION);

  // Register with background script
  chrome.runtime.sendMessage(
    {
      type: "PAGEVIEW_SCRIPT_LOADED",
      url: window.location.href,
    },
    (response) => {
      log("Registration response:", response);
    }
  );

  // Record the initial page view
  trackPageView();
}

// Track the current page view
async function trackPageView() {
  try {
    const viewData = await PageViewTracker.recordView();
    log(
      `Page view recorded. Total views: ${viewData.totalViews}, History entries: ${viewData.history.length}`
    );
  } catch (error) {
    console.error("[PageView] Error recording view:", error);
  }
}

// Set up messaging for popup communication
function setupMessaging() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log("Message received:", message);

    if (message.type === "GET_PAGE_VIEW_DATA") {
      log("Retrieving page view data");
      // Need to handle async response
      PageViewTracker.getData()
        .then((pageViewData) => {
          sendResponse({ success: true, data: pageViewData });
        })
        .catch((error) => {
          console.error("[PageView] Error getting data:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Indicates we'll send a response asynchronously
    } else if (message.type === "GET_PAGE_VIEW_HISTORY") {
      log("Retrieving page view history");
      PageViewTracker.getHistory()
        .then((history) => {
          sendResponse({ success: true, history });
        })
        .catch((error) => {
          console.error("[PageView] Error getting history:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
    } else if (message.type === "RESET_PAGE_VIEWS") {
      log("Resetting page view data");
      PageViewTracker.reset()
        .then(() => {
          log("Page view data reset successfully");
        })
        .catch((error) => {
          console.error("[PageView] Error resetting data:", error);
        });
    } else if (message.type === "TRACK_PAGE_VIEW") {
      log("Tracking page view from request");
      trackPageView()
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error("[PageView] Error tracking view:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Indicates we'll send a response asynchronously
    }

    return true; // Keep the message channel open for async response
  });
}

// Track single-page app navigation
function trackSpaNavigation() {
  // Store initial URL
  let lastUrl = document.location.href;

  // Create an observer to detect URL changes
  const observer = new MutationObserver(() => {
    if (lastUrl !== document.location.href) {
      log(`URL changed from ${lastUrl} to ${document.location.href}`);
      lastUrl = document.location.href;
      trackPageView();
    }
  });

  // Only observe if body exists
  if (document.body) {
    // Start observing the document body for DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } else {
    log("Document body not available yet for SPA navigation tracking");
  }

  // Also listen for History API changes
  window.addEventListener("popstate", () => {
    log("Navigation detected via popstate");
    trackPageView();
  });
}

// Main execution
try {
  // Log that script is starting
  console.log("[PageView] Content script starting");

  // Initialize immediately
  initialize();
  setupMessaging();

  // Start tracking SPA navigation after DOM is fully loaded
  if (document.readyState === "complete") {
    trackSpaNavigation();
  } else {
    window.addEventListener("load", trackSpaNavigation);
  }
} catch (error) {
  console.error("[PageView] Error during initialization:", error);
}
