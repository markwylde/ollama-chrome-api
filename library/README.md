# ollama-chrome-api

`ollama-chrome-api` is a JavaScript library designed to facilitate interaction with the Ollama API through a Chrome extension or any web-based environment. It allows you to easily authorize and generate responses from the Ollama API using custom events.

Note that users must have the Ollama and the Ollama Chrome extension installed.

## Features

- **Authorization**: Handle authorization requests and responses.
- **Streaming**: Support for streaming responses from the Ollama API.
- **Event-driven**: Utilizes custom events for communication between different parts of your application.

## Installation

To install the `ollama-chrome-api` library, you can use npm:

```bash
npm install ollama-chrome-api
```

## Usage

### Authorization

The `authorize` function sets up an event listener for the `OllamaResponse` event and dispatches an `OllamaRequest` event to initiate the authorization process.

```javascript
import { authorize } from 'ollama-chrome-api';

document.getElementById('authorize').onclick = async () => {
  await authorize();
};
```

### Generating Responses

The `OllamaClient` class allows you to generate responses from the Ollama API. It handles the streaming of responses and processes each chunk of data.

```javascript
import { OllamaClient } from 'ollama-chrome-api';

document.getElementById('send').onclick = async () => {
  const promptInput = document.getElementById('prompt');
  const promptText = promptInput.value;
  if (!promptText) return;

  addMessage(promptText, 'user');
  promptInput.value = '';

  const ollama = new OllamaClient('http://localhost:11434');
  const stream = ollama.generate({
    model: 'llama3',
    prompt: promptText,
    stream: true
  });

  let botMessage = addMessage('', 'bot');

  for await (const chunk of stream) {
    botMessage.innerHTML += chunk.response;
    scrollMessagesToBottom();
  }
};

function addMessage(text, sender) {
  const messages = document.getElementById('messages');
  const message = document.createElement('li');
  message.className = `message ${sender}`;
  const pre = document.createElement('pre');
  pre.textContent = text;
  message.appendChild(pre);
  messages.appendChild(message);
  scrollMessagesToBottom();
  return pre;
}

function scrollMessagesToBottom() {
  const messages = document.getElementById('messages');
  messages.scrollTop = messages.scrollHeight;
}
```

### Example

A full example of how to use this library is available in the [example HTML file](./example.html). This example demonstrates how to set up a simple chat interface that interacts with the Ollama API.

## Documentation

### authorize()

Sets up an event listener for authorization and dispatches an event to request authorization information.

### OllamaClient

#### constructor(baseUrl)

- `baseUrl` (string): The base URL for the Ollama API.

#### generate({ model, prompt })

- `model` (string): The model to use for generating responses.
- `prompt` (string): The prompt to send to the model.

#### processChunk(chunk)

- `chunk` (string): The chunk of data to process.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contributing

This is a very rough idea and needs lot more work. Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss changes.
