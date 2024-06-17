chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', 'operation': 'remove' }
        ]
      },
      condition: {
        urlFilter: '|http*',
        initiatorDomains: [chrome.runtime.id],
        resourceTypes: ['xmlhttprequest']
      }
    }]
  });
});

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name === 'ollamaStream');

  port.onMessage.addListener(function(msg) {
    console.log('Received message:', msg);
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

      if (msg.action === 'request') {
        handleRequest(msg.data, port);
      }
    });
  });
});

function handleRequest(msg, port) {
  if (typeof msg.body === 'object') {
    msg.body = JSON.stringify(msg.body);
  }
  console.log(`Fetching from URL: http://localhost:11434${msg.url} with message:`, msg);

  fetch(`http://localhost:11434${msg.url}`, msg)
    .then(response => {
      const reader = response.body.getReader();
      function push() {
        reader.read().then(({ done, value }) => {
          if (done) {
            port.postMessage({ correlationId: msg.correlationId, done: true });
            port.disconnect();
            return;
          }
          let text = new TextDecoder('utf-8').decode(value);
          console.log('Received chunk:', text);
          port.postMessage({ correlationId: msg.correlationId, data: text, done: false });
          push();
        }).catch(error => {
          console.error('Read error:', error);
          port.postMessage({ correlationId: msg.correlationId, error: error.message, done: true });
          port.disconnect();
        });
      }
      push();
    })
    .catch(error => {
      console.error('Fetch error:', error);
      port.postMessage({ correlationId: msg.correlationId, error: error.message, done: true });
      port.disconnect();
    });
}
