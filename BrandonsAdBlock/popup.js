document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggle');
    const blockedCountEl = document.getElementById('blockedCount');

    // Load saved state
    chrome.storage.local.get({ adblock_enabled: true }, (data) => {
      toggle.checked = data.adblock_enabled;
    });
  
    // Toggle on change
    toggle.addEventListener('change', () => {
      const enabled = toggle.checked;
  
      chrome.storage.local.set({ adblock_enabled: enabled }, () => {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                [enabled ? "enableRulesetIds" : "disableRulesetIds"]: ["ruleset_1"]
                }, () => {
                console.log(`Adblocker is now ${enabled ? "enabled" : "disabled"}`);
            });
        });
    });

    chrome.storage.local.get({ globalBlockedCount: 0 }, (data) => {
        blockedCountEl.textContent = data.globalBlockedCount;
    });
    
    // Listen for real-time updates
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "updateBlockedCount") {
            blockedCountEl.textContent = message.count;
        }
    });
});