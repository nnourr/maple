import { countTokens } from "../utils/tokenizer";
import { debounce } from "../utils/debounce";

// Immediately log to verify script execution
console.log("[contentScript] SCRIPT STARTING - Version 1.0.3");

// Register this script with the background page
function registerWithBackground() {
  chrome.runtime.sendMessage(
    {
      type: "CONTENT_SCRIPT_LOADED",
      url: window.location.href,
    },
    (response) => {
      console.log("[contentScript] Registration response:", response);
    }
  );
}

// Keep the script alive by responding to background pings
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[contentScript] Message received", message);
});

// The rest of the script
try {
  // Register with background page
  registerWithBackground();

  // Add a global variable to window object to signal content script is loaded
  (window as any).chatGptTokenCounterLoaded = true;
  (window as any).chatGptTokenCounterLoadTime = new Date().toISOString();

  // Create the debug indicator
  function createDebugIndicator() {
    // Create a visible indicator on the page (only during debugging)
    const debugIndicator = document.createElement("div");
    debugIndicator.id = "token-counter-debug-indicator";
    debugIndicator.innerHTML = "Token Counter Active";
    debugIndicator.style.position = "fixed";
    debugIndicator.style.bottom = "10px";
    debugIndicator.style.right = "10px";
    debugIndicator.style.backgroundColor = "rgba(66, 133, 244, 0.8)";
    debugIndicator.style.color = "white";
    debugIndicator.style.padding = "5px 10px";
    debugIndicator.style.borderRadius = "4px";
    debugIndicator.style.fontSize = "12px";
    debugIndicator.style.zIndex = "9999";
    document.body.appendChild(debugIndicator);
    console.log("[contentScript] Debug indicator added to page");
  }

  // Create the initial debug indicator
  createDebugIndicator();

  // Force an immediate log to console that's not async
  document.body.dataset.extensionLoaded = "true";
  console.log(
    "[contentScript] Extension marker added to body",
    document.body.dataset.extensionLoaded
  );

  interface SessionStats {
    inputTokens: number;
    outputTokens: number;
    conversations: number;
  }

  interface Message {
    type: string;
    data?: SessionStats;
  }

  console.log("[contentScript] Script loaded");

  // Track token counts for the current session
  let sessionStats: SessionStats = {
    inputTokens: 0,
    outputTokens: 0,
    conversations: 0,
  };

  // Load existing stats
  chrome.storage.local.get(["tokenStats"], (result) => {
    console.log("[contentScript] Loaded stats from storage", result);
    if (result.tokenStats) {
      sessionStats = result.tokenStats as SessionStats;
      console.log("[contentScript] Using stored stats", sessionStats);
    }
  });

  // Observer configuration
  const observerConfig: MutationObserverInit = {
    childList: true,
    subtree: true,
  };

  // Function to process user input
  function processUserInput(element: Element): void {
    console.log("[contentScript] processUserInput called");
    const textElement = element.querySelector(".bg-token-message-surface");
    if (!textElement || !textElement.textContent?.length) {
      console.error("[contentScript] Text element not found");
      return;
    }
    const text = textElement.textContent;
    console.log(text);
  }

  // Function to process ChatGpt output
  function processChatGptOutput(): void {
    console.log("[contentScript] processChatGptOutput called");
    const gptOutputElements = document.querySelectorAll(".markdown.prose");
    console.log(
      "[contentScript] Found GPT output elements:",
      gptOutputElements.length
    );
    gptOutputElements.forEach((element) => {
      if (!(element as HTMLElement).dataset.counted) {
        const text = element.textContent || "";
        const tokens = countTokens(text);
        console.log("[contentScript] Processing GPT output:", {
          textLength: text.length,
          tokens,
        });
        sessionStats.outputTokens += tokens;
        (element as HTMLElement).dataset.counted = "true";

        updateStats();
      }
    });
  }

  // Update statistics in storage
  function updateStats(): void {
    console.log("[contentScript] updateStats called", sessionStats);
    chrome.storage.local.set({ tokenStats: sessionStats });

    // Also notify popup if it's open
    console.log("[contentScript] Sending update message to popup");
    chrome.runtime.sendMessage({
      type: "TOKEN_COUNT_UPDATE",
      data: sessionStats,
    });
  }

  const calculateTokens = debounce(() => {
    console.log("[contentScript] calculateTokens called");
    document
      .querySelectorAll("[data-message-author-role='user']")
      .forEach((element) => {
        processUserInput(element);
      });
  }, 5000);

  // Initialize observer
  const observer = new MutationObserver(() => {
    console.log("[contentScript] MutationObserver callback fired");
    calculateTokens();
  });

  const presentationElement = document.querySelector('[role="presentation"]');

  if (!presentationElement) {
    console.error("[contentScript] Presentation element not found");
    // Start observing
  } else {
    console.log("[contentScript] Starting to observe DOM changes");
    observer.observe(presentationElement, observerConfig);
  }

  // Listen for messages from the popup
  console.log("[contentScript] Setting up message listener");
  chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
      console.log("[contentScript] Message received", message, sender);
      if (message.type === "GET_TOKEN_COUNTS") {
        console.log("[contentScript] Sending token counts", sessionStats);
        sendResponse(sessionStats);
      } else if (message.type === "RESET_COUNTS") {
        console.log("[contentScript] Resetting counts");
        sessionStats = {
          inputTokens: 0,
          outputTokens: 0,
          conversations: 0,
        };
        updateStats();
        sendResponse({ success: true });
      }
      return true;
    }
  );

  // Add a ping function for the popup to check if content script is alive
  window.addEventListener("message", (event) => {
    console.log("[contentScript] Window message received", event.data);
    if (event.data.type === "CONTENT_SCRIPT_PING") {
      console.log("[contentScript] Ping received, sending pong");
      // Respond in multiple ways to ensure communication:
      // 1. Post a message
      window.postMessage(
        { type: "CONTENT_SCRIPT_PONG", timestamp: Date.now() },
        "*"
      );

      // 2. Update the global variable
      (window as any).chatGptTokenCounterPonged = Date.now();

      // 3. Add a temporary visual indicator
      const pingResponse = document.createElement("div");
      pingResponse.style.position = "fixed";
      pingResponse.style.top = "10px";
      pingResponse.style.left = "10px";
      pingResponse.style.backgroundColor = "green";
      pingResponse.style.color = "white";
      pingResponse.style.padding = "5px";
      pingResponse.style.zIndex = "10000";
      pingResponse.textContent = "Token Counter: PONG!";
      document.body.appendChild(pingResponse);

      // Remove the indicator after 2 seconds
      setTimeout(() => {
        if (document.body.contains(pingResponse)) {
          document.body.removeChild(pingResponse);
        }
      }, 2000);
    }
  });
} catch (error: any) {
  console.error("[contentScript] ERROR DURING INITIALIZATION:", error);
  // Try to report the error visibly on the page
  try {
    const errorIndicator = document.createElement("div");
    errorIndicator.style.position = "fixed";
    errorIndicator.style.top = "10px";
    errorIndicator.style.right = "10px";
    errorIndicator.style.backgroundColor = "red";
    errorIndicator.style.color = "white";
    errorIndicator.style.padding = "10px";
    errorIndicator.style.zIndex = "10000";
    errorIndicator.textContent = `Token Counter Error: ${error.message}`;
    document.body.appendChild(errorIndicator);
  } catch (e) {
    // Last resort - we can't even add an error indicator
    console.error("[contentScript] Failed to add error indicator:", e);
  }
}
