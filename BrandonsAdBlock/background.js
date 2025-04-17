let globalBlockedCount = 0;
let whitelist = [];

chrome.storage.local.get({ whitelist: [] }, (data) => {
    whitelist = data.whitelist;
});
  
// Update whitelist in real time
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "whitelist-updated") {
        chrome.storage.local.get({ whitelist: [] }, (data) => {
            whitelist = data.whitelist;
        });
    }
});
  
// Check if domain is whitelisted
function isWhitelisted(url) {
    try {
        const domain = new URL(url).hostname;
        return whitelist.some(w => domain.endsWith(w));
    } catch (e) {
        return false;
    }
}
  
// Watch for tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const shouldDisable = isWhitelisted(tab.url);
  
        chrome.declarativeNetRequest.updateEnabledRulesets({
            [shouldDisable ? "disableRulesetIds" : "enableRulesetIds"]: ["ruleset_1"]
        }, () => {
            console.log(`Blocking ${shouldDisable ? "disabled" : "enabled"} for ${tab.url}`);
        });
    }
});

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