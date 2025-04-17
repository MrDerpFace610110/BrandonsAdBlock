document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggle');
  
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
});