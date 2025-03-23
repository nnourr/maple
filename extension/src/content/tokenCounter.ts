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
