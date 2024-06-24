import syncRules from './syncRules.js';

let tabId = undefined;
chrome.webRequest.onBeforeRequest.addListener(
  async function(details) {
    const url = new URL(details.url);
    if (url.host === "localhost:11434") {
      const vars = await chrome.storage.local.get();

      const hosts = Object
        .keys(vars)
        .filter(v => v.startsWith('ollamaAuthorized:'))
        .map(v => v.slice('ollamaAuthorized:'.length));

      const initiator = new URL(details.initiator).hostname;

      if (hosts.includes(initiator)) {
        return;
      }

      if (tabId) {
        try {
          await chrome.tabs.remove(tabId);
        } catch (e) {
          console.warn(`Failed to close tab with id ${tabId}: ${e.message}`);
        }
        tabId = null;
      }

      const newTab = await chrome.windows.create({
        focused: true,
        url: `chrome-extension://${chrome.runtime.id}/request.html?host=${initiator}`,
        type: 'popup',
        width: 400,
        height: 150
      });

      tabId = newTab.id;
    }
  },
  { urls: ["<all_urls>"] }
);

chrome.runtime.onInstalled.addListener(async () => {
  const vars = await chrome.storage.local.get();

  const hosts = Object
    .keys(vars)
    .filter(v => v.startsWith('ollamaAuthorized:'))
    .map(v => v.slice('ollamaAuthorized:'.length));

  if (hosts.length === 0) {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1, 2]
    });
    return;
  }

  syncRules();
});
