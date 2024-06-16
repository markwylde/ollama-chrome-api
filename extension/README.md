# Ollama Chrome API Extension

## Overview
The **Ollama Chrome API** extension allows websites to access your locally running Ollama instance, enabling seamless communication and data exchange between web applications and the Ollama server.

## Features
- Authorize and manage domains that can interact with your Ollama instance.
- Stream responses from Ollama in real-time.

## Installation
I'm currently trying to get this added to the Chrome Web store.

1. Clone the repository:
    ```bash
    git clone git@github.com:markwylde/ollama-chrome-api.git
    ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click "Load unpacked" and select the `ollama-extension` directory.

## Usage
### Background Script
The background script (`background.js`) manages the extension's lifecycle events and handles requests to the Ollama server.

### Content Script
The content script (`content.js`) listens for custom events from the web page and communicates with the background script to handle authorization and data requests.

### Example Integration
An example HTML file (`example.html`) demonstrates how to use the OllamaClient to interact with the Ollama API:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script type="module">
    const ollama = new OllamaClient('http://localhost:11434');
    const stream = ollama.generate({
        model: 'llama3',
        prompt: 'Why is the sky blue?'
    });

    for await (const chunk of stream) {
        console.log(chunk);
    }
  </script>
</body>
</html>
```

## Permissions
The extension requires the following permissions:
- `tabs`, `activeTab`, `scripting`, `webRequest`, `storage`
- `declarativeNetRequest`, `declarativeNetRequestWithHostAccess`
- Access to `http://localhost:11434/*`

## Manifest
The `manifest.json` file outlines the extension's configuration, including permissions, background scripts, content scripts, and web accessible resources.

## Icons
The extension includes icons in three sizes:
- `icon16.png`
- `icon48.png`
- `icon128.png`

## Popup
The popup interface (`popup.html` and `popup.js`) allows users to view and manage authorized domains. Users can delete authorizations as needed.

## Request Authorization
The request authorization page (`request.html` and `request.js`) handles user consent for domain access to the Ollama instance.

## Scripts
### `background.js`
Handles installation, network request modifications, and message passing between content scripts and the Ollama server.

### `content.js`
Listens for custom events from web pages and communicates with the background script.

### `popup.js`
Manages the display and deletion of authorized domains.

### `request.js`
Handles user consent for domain access.

### `script.js`
Provides the main API client for interacting with the Ollama server.

## Contributing
1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request.

## License
This project is licensed under the MIT License.

For more information, visit the [repository](https://github.com/markwylde/ollama-chrome-api).
