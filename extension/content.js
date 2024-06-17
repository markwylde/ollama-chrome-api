;(function() {
  const b = typeof browser !== 'undefined' ? browser : chrome;

  window.addEventListener("OllamaRequest", function(event) {
    const action = event.detail.action;
    const correlationId = event.detail.correlationId;

    if (action === "authorize:info") {
      const url = new URL(b.runtime.getURL('request.html'));
      url.searchParams.set('origin', window.location.origin);

      const customEvent = new CustomEvent("OllamaResponse", {
        detail: {
          error: 'REQUIRES_AUTH',
          url: url.toString(),
          action: action,
          correlationId: correlationId
        }
      });
      window.dispatchEvent(customEvent);
    } else if (action === "ollama:request") {
      const port = chrome.runtime.connect({ name: "ollamaStream" });
      port.postMessage({
        action: 'request',
        data: event.detail.data,
        correlationId: correlationId
      });

      port.onMessage.addListener(function(msg) {
        msg.correlationId = correlationId;
        const customEvent = new CustomEvent("OllamaResponse", { detail: msg });
        window.dispatchEvent(customEvent);
      });

      port.onDisconnect.addListener(function() {
        if (chrome.runtime.lastError) {
          console.error('Port disconnected with error:', chrome.runtime.lastError);
          const customEvent = new CustomEvent("OllamaResponse", {
            detail: {
              correlationId: correlationId,
              error: chrome.runtime.lastError.message,
              done: true
            }
          });
          window.dispatchEvent(customEvent);
        }
      });
    }
  });
})();
