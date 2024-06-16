# ollama-chrome-api

`ollama-chrome-api` is a Chrome Extension and a JavaScript library designed to facilitate interaction with the Ollama API through a Chrome extension or any web-based environment.

It allows websites to communicate securely (explicit authorization is required on a per site basis) with a locally running Ollama instance, directly on the visitors machine.

This should allow you to make a completely serverless, client only chat web ui, so long as the user can install the Chrome Extension and Ollama.

## Features

- **Authorization**: Handle authorization requests and responses.
- **Streaming**: Support for streaming responses from the Ollama API.
- **Event-driven**: Utilizes custom events for communication between different parts of your application.

## Installation

### Chrome Extension

I'm currently trying to get the extension added to the Chrome Web Store, but in the mean time you can download it and install the extension in dev mode. More information is in the [extension](./extension/) README.

### Library

I have built an ES Module library and published on npmjs.

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

A full example of how to use this library is available in the [example HTML file](./library/example/index.html). This example demonstrates how to set up a simple chat interface that interacts with the Ollama API.

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

This project is licensed under the MIT License.

## Contributing

This is a very rough idea and needs lot more work. Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss changes.
