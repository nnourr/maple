function updateTokenCount() {
  if (window.location.href.includes("search")) {
    chrome.storage.local.get("tokens", (result) => {
      let tokens = result.tokens;
      if (tokens) {
        tokens += 15;
      } else {
        tokens = 15;
      }
      chrome.storage.local.set({ tokens: tokens }, () => {
        console.log("[TokenCounter] Tokens is set to " + tokens);
      });
    });
  }
}

updateTokenCount();

let prevUrl = window.location.href;
const observer = new MutationObserver(() => {
  console.log("[TokenTracker] MutationObserver callback fired");
  console.log("[TokenTracker] Current URL: " + window.location.href);
  console.log("[TokenTracker] prevUrl URL: " + prevUrl);

  const url = window.location.href;
  if (url !== prevUrl) {
    updateTokenCount();
    prevUrl = url;
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
