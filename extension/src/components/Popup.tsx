import React, { useState, useEffect } from "react";
import TokenCounter from "./TokenCounter";
import PageViewStats from "./PageViewStats";
import { TokenDatabase, TokenStats } from "../utils/db";
import UnifiedStatsChart from "./UnifiedStatsChart";
import CarbonFootprintDisplay from "./CarbonFootprintDisplay";

interface Message {
  type: string;
  data?: TokenStats;
}

const Popup: React.FC = () => {
  console.log("[Popup] Component rendering");
  const [stats, setStats] = useState<TokenStats>({
    timestamp: Date.now(),
    prompts: 0,
    cachedMessages: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [contentScriptActive, setContentScriptActive] = useState<
    boolean | null
  >(null);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [checkAttempts, setCheckAttempts] = useState(0);

  // Function to load token stats from the database
  const loadStatsFromDatabase = async () => {
    try {
      const latestStats = await TokenDatabase.getLatestStats();
      if (latestStats) {
        console.log("[Popup] Loaded stats from database", latestStats);
        setStats(latestStats);
      }
    } catch (error) {
      console.error("[Popup] Error loading stats from database", error);
    }
  };

  // Function to load token stats from the current tab
  const loadStatsFromCurrentTab = () => {
    console.log("[Popup] Loading stats from current tab");
    setDebugInfo("Querying active tab...");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("[Popup] Active tab query result", tabs);
      setDebugInfo((prev) => prev + "\nFound tab: " + (tabs[0]?.url || "none"));

      // Update the current tab ID
      if (tabs[0]?.id) {
        setCurrentTabId(tabs[0].id);
        setDebugInfo((prev) => prev + `\nTab ID: ${tabs[0].id}`);
      }

      if (tabs[0] && tabs[0].url?.includes("chatgpt.com")) {
        setDebugInfo((prev) => prev + "\nOn ChatGPT page ✓");

        // Check content script status on the new tab
        checkContentScript(tabs[0].id!);

        console.log(
          "[Popup] Sending GET_TOKEN_COUNTS message to tab",
          tabs[0].id
        );
        setDebugInfo((prev) => prev + "\nSending message to content script...");

        chrome.tabs.sendMessage(
          tabs[0].id!,
          { type: "GET_TOKEN_COUNTS" },
          (response: TokenStats | undefined) => {
            const error = chrome.runtime.lastError;
            if (error) {
              console.error("[Popup] Error sending message:", error);
              setDebugInfo((prev) => prev + `\nError: ${error.message}`);
              setContentScriptActive(false);
              setLoading(false);

              // Fall back to database if content script is not available
              loadStatsFromDatabase().then(() => setLoading(false));
              return;
            }

            console.log("[Popup] Received response from tab", response);
            setDebugInfo(
              (prev) => prev + "\nReceived response from content script ✓"
            );

            if (response) {
              setStats(response);
              setContentScriptActive(true);
            } else {
              setDebugInfo((prev) => prev + "\nNo data in response");
              setContentScriptActive(false);

              // Fall back to database if no response data
              loadStatsFromDatabase();
            }
            setLoading(false);
          }
        );
      } else {
        console.log("[Popup] Not on ChatGPT page");
        setDebugInfo((prev) => prev + "\nNot on ChatGPT page ✗");
        setContentScriptActive(false);

        // Load from database if not on ChatGPT page
        loadStatsFromDatabase().then(() => setLoading(false));
      }
    });
  };

  // Check if content script is responsive using multiple methods
  const checkContentScript = (tabId: number) => {
    setCheckAttempts((prev) => prev + 1);
    console.log("[Popup] Checking if content script is active on tab", tabId);
    setDebugInfo((prev) => prev + "\nChecking content script...");

    try {
      // First method: Direct script injection to check for global variable
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: () => {
            // Check if our global marker exists
            const isLoaded = !!(window as any).chatGptTokenCounterLoaded;
            const loadTime =
              (window as any).chatGptTokenCounterLoadTime || "unknown";
            const debugIndicator = !!document.getElementById(
              "token-counter-debug-indicator"
            );

            return {
              isLoaded,
              loadTime,
              debugIndicator,
              documentReady: document.readyState,
              url: window.location.href,
            };
          },
        },
        (results) => {
          if (chrome.runtime.lastError!) {
            console.error(
              "[Popup] Error executing script:",
              chrome.runtime.lastError!
            );
            setDebugInfo(
              (prev) =>
                prev +
                `\nScript check error: ${chrome.runtime.lastError!?.message}`
            );
            return;
          }

          if (results && results[0]?.result) {
            const result = results[0].result;
            console.log("[Popup] Content script check results:", result);
            setDebugInfo(
              (prev) =>
                prev + `\nScript loaded: ${result.isLoaded ? "Yes ✓" : "No ✗"}`
            );
            setDebugInfo((prev) => prev + `\nLoad time: ${result.loadTime}`);
            setDebugInfo(
              (prev) =>
                prev +
                `\nDebug indicator: ${
                  result.debugIndicator ? "Visible ✓" : "Not found ✗"
                }`
            );

            if (result.isLoaded) {
              setContentScriptActive(true);
              return;
            }
          }

          // If we couldn't confirm using global variable, try ping-pong
          pingContentScript(tabId);
        }
      );
    } catch (error: any) {
      console.error("[Popup] Error checking content script:", error);
      setDebugInfo((prev) => prev + `\nCheck error: ${error.message}`);
      pingContentScript(tabId); // Try alternative method
    }
  };

  // Secondary check using ping-pong messaging
  const pingContentScript = (tabId: number) => {
    console.log("[Popup] Pinging content script");
    setDebugInfo((prev) => prev + "\nPinging content script...");

    try {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: () => {
            console.log("[Injected Script] Pinging content script");

            // Track if we got a response
            let receivedPong = false;

            // Send ping message
            window.postMessage(
              { type: "CONTENT_SCRIPT_PING", from: "popup" },
              "*"
            );

            // Setup listener for response
            const messageListener = (event: MessageEvent) => {
              if (event.data.type === "CONTENT_SCRIPT_PONG") {
                console.log("[Injected Script] Content script responded");
                receivedPong = true;
                window.postMessage(
                  { type: "CONTENT_SCRIPT_CONFIRMED", timestamp: Date.now() },
                  "*"
                );
              }
            };
            window.addEventListener("message", messageListener);

            // Return result after a short delay
            return new Promise((resolve) => {
              setTimeout(() => {
                window.removeEventListener("message", messageListener);
                resolve({
                  receivedPong,
                  pongTimestamp: (window as any).chatGptTokenCounterPonged,
                  now: Date.now(),
                });
              }, 500); // Wait 500ms for response
            });
          },
        },
        (results) => {
          if (chrome.runtime.lastError!) {
            console.error(
              "[Popup] Error pinging content script:",
              chrome.runtime.lastError!
            );
            setDebugInfo(
              (prev) =>
                prev + `\nPing error: ${chrome.runtime.lastError!.message}`
            );
            setContentScriptActive(false);
            return;
          }

          if (results && results[0]?.result) {
            // We need to handle the promise result
            (results[0].result as Promise<any>).then((pingResult: any) => {
              console.log("[Popup] Ping result:", pingResult);

              if (pingResult.receivedPong) {
                setDebugInfo((prev) => prev + "\nReceived PONG response ✓");
                setContentScriptActive(true);
              } else {
                setDebugInfo((prev) => prev + "\nNo PONG response received ✗");

                if (pingResult.pongTimestamp) {
                  const lastPong = new Date(
                    pingResult.pongTimestamp
                  ).toLocaleTimeString();
                  setDebugInfo(
                    (prev) => prev + `\nLast PONG was at ${lastPong}`
                  );

                  // If we've seen a pong before but not now, script might be active but not responding
                  if (Date.now() - pingResult.pongTimestamp < 60000) {
                    // Within the last minute
                    setContentScriptActive(true);
                    setDebugInfo(
                      (prev) => prev + "\nContent script was recently active"
                    );
                  } else {
                    setContentScriptActive(false);
                  }
                } else {
                  setContentScriptActive(false);
                }
              }
            });
          } else {
            setDebugInfo((prev) => prev + "\nNo ping results");
            setContentScriptActive(false);
          }
        }
      );
    } catch (error: any) {
      console.error("[Popup] Error in ping execution:", error);
      setDebugInfo((prev) => prev + `\nPing execution error: ${error.message}`);
      setContentScriptActive(false);
    }
  };

  // Function to reload the content script
  const reloadContentScript = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        setDebugInfo("Attempting to reload content script...");

        // First try reinjecting the content script
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            files: ["contentScript.js"],
          },
          () => {
            if (chrome.runtime.lastError!) {
              console.error(
                "[Popup] Error reinjecting content script:",
                chrome.runtime.lastError!
              );
              setDebugInfo(
                (prev) =>
                  prev +
                  `\nReinjection failed: ${chrome.runtime.lastError!.message}`
              );
              setDebugInfo(
                (prev) => prev + "\nTry refreshing the page manually"
              );
            } else {
              setDebugInfo((prev) => prev + "\nContent script reinjected ✓");
              // Wait a moment for the script to initialize
              setTimeout(() => {
                checkContentScript(tabs[0].id!);
                loadStatsFromCurrentTab();
              }, 500);
            }
          }
        );
      }
    });
  };

  useEffect(() => {
    console.log("[Popup] useEffect hook running");
    setDebugInfo("Initializing...");

    // First try to load from database
    loadStatsFromDatabase();

    // Then try to get latest from content script
    loadStatsFromCurrentTab();

    // Listen for updates from content script
    const handleMessage = (message: Message) => {
      console.log("[Popup] Message received", message);
      if (message.type === "TOKEN_COUNT_UPDATE" && message.data) {
        console.log("[Popup] Updating stats from message", message.data);
        setStats(message.data);
      }
      return true;
    };

    // Listen for tab changes
    const handleTabActivated = (activeInfo: { tabId: number }) => {
      console.log("[Popup] Tab activated", activeInfo);
      loadStatsFromCurrentTab();
    };

    // Listen for tab updates (URL changes, etc.)
    const handleTabUpdated = (
      tabId: number,
      changeInfo: { status?: string; url?: string },
      tab: chrome.tabs.Tab
    ) => {
      // Only react to complete status updates for the current tab
      if (changeInfo.status === "complete" && tabId === currentTabId) {
        console.log("[Popup] Current tab updated", tabId, changeInfo);
        loadStatsFromCurrentTab();
      }
    };

    console.log("[Popup] Adding message and tab listeners");
    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.tabs.onActivated.addListener(handleTabActivated);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);

    return () => {
      console.log("[Popup] Cleanup: removing listeners");
      chrome.runtime.onMessage.removeListener(handleMessage);
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
    };
  }, [currentTabId]); // Re-run when currentTabId changes

  const handleReset = async (): Promise<void> => {
    console.log("[Popup] handleReset called");

    try {
      // First try to clear the database
      await TokenDatabase.clearStats();

      // Then try to reset via content script if on ChatGPT page
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log("[Popup] Active tab for reset", tabs);
        if (tabs[0] && tabs[0].url?.includes("chatgpt.com")) {
          console.log(
            "[Popup] Sending RESET_COUNTS message to tab",
            tabs[0].id
          );
          chrome.tabs.sendMessage(tabs[0].id!, { type: "RESET_COUNTS" }, () => {
            console.log("[Popup] Reset complete, updating local stats");

            const resetStats: TokenStats = {
              timestamp: Date.now(),
              prompts: 0,
              cachedMessages: [],
            };

            setStats(resetStats);
          });
        } else {
          // If not on ChatGPT page, just reset the popup state
          const resetStats: TokenStats = {
            timestamp: Date.now(),
            prompts: 0,
            cachedMessages: [],
          };

          setStats(resetStats);
          TokenDatabase.saveStats(resetStats);
        }
      });
    } catch (error) {
      console.error("[Popup] Error during reset", error);
    }
  };

  if (loading) {
    console.log("[Popup] Rendering loading state");
    return (
      <div className="p-5 text-center text-gray-500">Loading stats...</div>
    );
  }

  console.log("[Popup] Rendering with stats", stats);
  return (
    <div className="p-4 bg-[#efefe0] border-2 border-solid inside-">
      <header className="mb-4  pb-2">
        <div className="flex items-center justify-center gap-2">
          <img
            className="aspect-auto h-16"
            src={chrome.runtime.getURL("/logo.svg")}
            alt="Logo"
          />
          <img
            className="aspect-auto h-16"
            src={chrome.runtime.getURL("/logo-text.png")}
            alt="Logo"
          />
        </div>
        {/* {contentScriptActive === false && (
          <div className="bg-red-50 text-red-800 p-2 rounded text-xs text-center mt-1">
            Content script is not active. Please refresh the ChatGPT page.
            <button
              className="block mx-auto mt-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs hover:bg-gray-200"
              onClick={reloadContentScript}
            >
              Attempt Repair
            </button>
          </div>
        )} */}
      </header>

      <CarbonFootprintDisplay />
      <UnifiedStatsChart />

      <footer className="mt-4 text-center text-gray-500 text-xs">
        <small>
          Refresh the page if stats seem inaccurate
          <br />
          <button
            className="mt-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs hover:bg-gray-200"
            onClick={loadStatsFromCurrentTab}
          >
            Refresh Stats
          </button>
        </small>
      </footer>
    </div>
  );
};

export default Popup;
