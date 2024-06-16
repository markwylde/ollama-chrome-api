document.addEventListener('DOMContentLoaded', () => {
  const authorizedList = document.createElement('ul');
  document.body.appendChild(authorizedList);

  // Function to render the authorized domains list
  const renderAuthorizedDomains = (domains) => {
    authorizedList.innerHTML = ''; // Clear the list
    Object.keys(domains).forEach((key) => {
      if (key.startsWith('ollamaAuthorized:')) {
        const origin = key.split('ollamaAuthorized:')[1];
        const listItem = document.createElement('li');
        listItem.textContent = origin;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
          chrome.storage.local.remove(key, () => {
            renderAuthorizedDomains(domains);
          });
        });

        listItem.appendChild(deleteButton);
        authorizedList.appendChild(listItem);
      }
    });
  };

  // Fetch authorized domains from chrome.storage.local
  chrome.storage.local.get(null, (items) => {
    renderAuthorizedDomains(items);
  });

  // Listen for storage changes to keep the list updated
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      chrome.storage.local.get(null, (items) => {
        renderAuthorizedDomains(items);
      });
    }
  });
});
