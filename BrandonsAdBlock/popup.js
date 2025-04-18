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

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab || !tab.url) return;
    
        const url = new URL(tab.url);
        currentDomain = url.hostname;
    
        chrome.storage.local.get({ whitelist: [] }, (data) => {
            const whitelist = new Set(data.whitelist);
            isWhitelisted = whitelist.has(currentDomain);
            whitelistBtn.textContent = isWhitelisted ? "Remove from Whitelist" : "Whitelist This Site";
        });
    });
    
    // Toggle whitelist state
    whitelistBtn.addEventListener('click', () => {
        if (!currentDomain) return;
    
        chrome.storage.local.get({ whitelist: [] }, (data) => {
            let whitelist = new Set(data.whitelist);
    
            if (isWhitelisted) {
                whitelist.delete(currentDomain);
            } else {
                whitelist.add(currentDomain);
            }
    
            chrome.storage.local.set({ whitelist: [...whitelist] }, () => {
                isWhitelisted = !isWhitelisted;
                whitelistBtn.textContent = isWhitelisted ? "Remove from Whitelist" : "Whitelist This Site";
                chrome.runtime.sendMessage({ type: 'whitelist-updated' });
            });
        });
    });
});