import syncRules from './syncRules.js';

document.addEventListener('DOMContentLoaded', () => {
  const allowButton = document.querySelector('#allowButton');
  const denyButton = document.querySelector('#denyButton');

  const host = new URLSearchParams(window.location.search).get('host')

  allowButton.addEventListener('click', () => {
    chrome.storage.local.set({['ollamaAuthorized:' + host]: true}, async () => {
      await syncRules();
      window.close();
    });
  });

  denyButton.addEventListener('click', () => {
    chrome.storage.local.set({['ollamaAuthorized:' + host]: false}, async () => {
      await syncRules();
      window.close();
    });
  });
});
