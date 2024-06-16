document.addEventListener('DOMContentLoaded', () => {
    const authorizedList = document.getElementById('authorizedList');

    // Function to render the authorized domains list
    const renderAuthorizedDomains = (domains) => {
        authorizedList.innerHTML = ''; // Clear the list
        Object.keys(domains).forEach((key) => {
            if (key.startsWith('ollamaAuthorized:')) {
                const origin = key.split('ollamaAuthorized:')[1];
                const listItem = document.createElement('tr');

                const domainCell = document.createElement('td');
                domainCell.textContent = origin;
                listItem.appendChild(domainCell);

                const actionCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => {
                    chrome.storage.local.remove(key, () => {
                        renderAuthorizedDomains(domains);
                    });
                });
                actionCell.appendChild(deleteButton);
                listItem.appendChild(actionCell);

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
