let globalBlockedCount = 0;

// Listen for rules that match
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  globalBlockedCount++;

  // Store new value in local storage
  chrome.storage.local.set({ globalBlockedCount });

  // Broadcast update to popup (if open)
  chrome.runtime.sendMessage({ type: "updateBlockedCount", count: globalBlockedCount });
});

// Restore count on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get({ globalBlockedCount: 0 }, (data) => {
    globalBlockedCount = data.globalBlockedCount;
  });
});