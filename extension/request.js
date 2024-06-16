document.addEventListener('DOMContentLoaded', () => {
  const allowButton = document.querySelector('#allowButton');
  const denyButton = document.querySelector('#denyButton');

  allowButton.addEventListener('click', () => {
    chrome.storage.local.set({['ollamaAuthorized:' + new URLSearchParams(window.location.search).get('origin')]: true}, () => {
      window.close();
    });
  });

  denyButton.addEventListener('click', () => {
    chrome.storage.local.set({['ollamaAuthorized:' + new URLSearchParams(window.location.search).get('origin')]: false}, () => {
      window.close();
    });
  });
});
