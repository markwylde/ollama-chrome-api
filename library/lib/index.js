export function authorize() {
  const responseHandler = (event) => {
    const detail = event.detail;

    if (detail.action === "authorize:info") {
      let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=400,height=100,left=100,top=100`;
      window.open(detail.url, null, params);
      window.removeEventListener("OllamaResponse", responseHandler);
    } else if (detail.error) {
      console.error('Authorization error:', detail.error);
      displayError(detail.error);
    }
  }

  window.addEventListener("OllamaResponse", responseHandler);

  const authorizeEvent = new CustomEvent("OllamaRequest", {
    detail: {
      action: "authorize:info",
      correlationId: generateCorrelationId()
    }
  });
  window.dispatchEvent(authorizeEvent);
}

export function ollamaRequest(data) {
  const correlationId = generateCorrelationId();
  let streamController = null;
  let partialChunk = '';

  const listener = (event) => {

    const response = event.detail;
    if (response.correlationId !== correlationId) return;

    if (response.error) {
      console.error('Request error:', response.error);
      displayError(response.error);
      if (streamController) {
        streamController.error(response.error);
      }
      window.removeEventListener("OllamaResponse", listener);
    } else {
      try {
        if (response.data) {
          partialChunk += response.data;
          let boundary = partialChunk.indexOf('\n');
          while (boundary !== -1) {
            const jsonString = partialChunk.slice(0, boundary);
            partialChunk = partialChunk.slice(boundary + 1);
            boundary = partialChunk.indexOf('\n');

            try {
              const obj = JSON.parse(jsonString);
              if (streamController) {
                streamController.enqueue(obj);
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
              displayError('Error parsing JSON: ' + e.message);
            }
          }
        }
      } catch (e) {
        console.error('Stream enqueue error:', e);
        displayError('Stream enqueue error: ' + e.message);
      }
      if (response.done && streamController) {
        streamController.close();
        window.removeEventListener("OllamaResponse", listener);
      }
    }
  }

  window.addEventListener("OllamaResponse", listener);

  const event = new CustomEvent("OllamaRequest", {
    detail: {
      action: "ollama:request",
      data,
      correlationId
    }
  });
  window.dispatchEvent(event);

  const stream = new ReadableStream({
    start: controller => {
      streamController = controller;
    },
  });

  async function* generate() {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          yield value;
        }
      }
    } catch (error) {
      console.error('Stream read error:', error);
      displayError('Stream read error: ' + error.message);
    }
  }

  return generate();
}

function generateCorrelationId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function displayError(error) {
  const errorElement = document.createElement('div');
  errorElement.style.color = 'red';
  errorElement.textContent = `Error: ${error}`;
  document.body.appendChild(errorElement);
}
