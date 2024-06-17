import Emittery from 'emittery';

export function authorize() {
  const emitter = new Emittery();
  const correlationId = generateCorrelationId();

  const responseHandler = (event) => {
    const detail = event.detail;
    if (detail.correlationId !== correlationId) return;

    if (detail.action === "authorize:info") {
      let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=400,height=100,left=100,top=100`;
      window.open(detail.url, null, params);
      emitter.emit('authorized', detail.url);
      window.removeEventListener("OllamaResponse", responseHandler);
    } else if (detail.error) {
      console.error('Authorization error:', detail.error);
      emitter.emit('error', detail.error);
      window.removeEventListener("OllamaResponse", responseHandler);
    }
  };

  window.addEventListener("OllamaResponse", responseHandler);

  const authorizeEvent = new CustomEvent("OllamaRequest", {
    detail: {
      action: "authorize:info",
      correlationId
    }
  });
  window.dispatchEvent(authorizeEvent);

  return emitter;
}

export function ollamaRequest(data) {
  const emitter = new Emittery();
  const correlationId = generateCorrelationId();

  const listener = (event) => {
    const response = event.detail;
    if (response.correlationId !== correlationId) return;

    if (response.error) {
      console.error('Request error:', response.error);
      emitter.emit('error', response.error);
    } else {
      try {
        processChunk(response.data, emitter);
      } catch (e) {
        console.error('Stream process error:', e);
        emitter.emit('error', e.message);
      }
      if (response.done) {
        emitter.emit('done');
      }
    }
  };

  window.addEventListener("OllamaResponse", listener);
  dispatchRequest(data, correlationId);

  return emitter;
}

function dispatchRequest(data, correlationId) {
  const event = new CustomEvent("OllamaRequest", {
    detail: {
      action: "ollama:request",
      data,
      correlationId
    }
  });
  window.dispatchEvent(event);
}

function processChunk(data, emitter) {
  let partialChunk = '';
  partialChunk += data;
  let boundary = partialChunk.indexOf('\n');
  while (boundary !== -1) {
    const jsonString = partialChunk.slice(0, boundary);
    partialChunk = partialChunk.slice(boundary + 1);
    try {
      const obj = JSON.parse(jsonString);
      emitter.emit('data', obj);
    } catch (e) {
      throw new Error('Error parsing JSON: ' + e.message);
    }
    boundary = partialChunk.indexOf('\n');
  }
}

function generateCorrelationId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
