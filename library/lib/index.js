export function authorize() {
  const responseHandler = (event) => {
    const detail = event.detail;

    if (detail.action === "authorize:info") {
      let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=400,height=100,left=100,top=100`;
      window.open(detail.url, null, params);
      window.removeEventListener("OllamaResponse", responseHandler);
    }
  }

  window.addEventListener("OllamaResponse", responseHandler);

  const authorizeEvent = new CustomEvent("OllamaRequest", {
    detail: { action: "authorize:info", correlationId: generateCorrelationId() }
  });
  window.dispatchEvent(authorizeEvent);
}

export class OllamaClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.correlationId = generateCorrelationId();
    this.initStream();
  }

  initStream() {
    this.streamController = null;
    this.stream = new ReadableStream({
      start: controller => {
        this.streamController = controller;
        window.addEventListener("OllamaResponse", this.listener.bind(this));
      }
    }).getReader();
  }

  listener(event) {
    const response = event.detail;
    if (response.correlationId !== this.correlationId) return;

    if (response.error) {
      console.error('Error:', response.error);
      if (this.streamController) {
        this.streamController.error(response.error);
      }
      window.removeEventListener("OllamaResponse", this.listener.bind(this));
    } else {
      try {
        if (response.data) {
          if (this.streamController) {
            this.streamController.enqueue(response.data);
          }
        }
      } catch (e) {
        console.error('Stream enqueue error:', e);
      }
      if (response.done && this.streamController) {
        this.streamController.close();
        window.removeEventListener("OllamaResponse", this.listener.bind(this));
      }
    }
  }

  async *generate(data) {
    const url = `${this.baseUrl}/api/chat`;

    const event = new CustomEvent("OllamaRequest", {
      detail: {
        action: "ollama:generate",
        url: url,
        data: data,
        correlationId: this.correlationId
      }
    });
    window.dispatchEvent(event);

    try {
      while (true) {
        const { done, value } = await this.stream.read();
        if (done) break;
        if (value) {
          yield* this.processChunk(value);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  *processChunk(chunk) {
    if (!chunk) {
      console.error('Received an empty chunk');
      return;
    }

    const jsons = chunk.trim().split(/}\s*{/).map((line, index, arr) => {
      if (index !== 0) line = '{' + line;
      if (index !== arr.length - 1) line = line + '}';
      return line;
    });

    for (const json of jsons) {
      try {
        const obj = JSON.parse(json);
        yield obj;
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    }
  }
}

function generateCorrelationId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
