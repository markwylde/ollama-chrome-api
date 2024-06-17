chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
      "id": 1,
      "priority": 1,
      "action": {
        "type": "modifyHeaders",
        "requestHeaders": [
          { "header": "Origin", "operation": "remove" }
        ]
      },
      "condition": {
        "urlFilter": "|http*",
        "initiatorDomains": [chrome.runtime.id],
        "resourceTypes": ["xmlhttprequest"]
      }
    }]
  });
});

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name === "ollamaStream");

  port.onMessage.addListener(function(msg) {
    const origin = new URL(port.sender.url).origin;
    const authKey = 'ollamaAuthorized:' + origin;

    chrome.storage.local.get([authKey], function(result) {
      const authorized = result[authKey];
      console.log(`Authorization status for ${authKey}: ${authorized}`);

      if (!authorized) {
        port.postMessage({ correlationId: msg.correlationId, error: 'Not authorized', done: true });
        port.disconnect();
        return;
      }

      if (msg.action === 'generate' && msg.url) {
        handleGenerateRequest(msg, port);
      }
    });
  });
});

function handleGenerateRequest(msg, port) {
  fetch(msg.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(msg.data)
  })
  .then(response => response.body.getReader())
  .then(reader => {
    function push() {
      reader.read().then(({ done, value }) => {
        if (done) {
          port.postMessage({ correlationId: msg.correlationId, done: true });
          port.disconnect();
          return;
        }
        let text = new TextDecoder("utf-8").decode(value);
        port.postMessage({ correlationId: msg.correlationId, data: text, done: false });
        push();
      });
    }
    push();
  })
  .catch(error => {
    port.postMessage({ correlationId: msg.correlationId, error: error.message, done: true });
    port.disconnect();
  });
}
