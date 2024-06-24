export default async function syncRules () {
  const vars = await chrome.storage.local.get();

  const hosts = Object
    .keys(vars)
    .filter(v => v.startsWith('ollamaAuthorized:'))
    .filter(v => Boolean(vars[v]))
    .map(v => v.slice('ollamaAuthorized:'.length));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2],
    addRules: [{
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', 'operation': 'remove' }
        ]
      },
      condition: {
        initiatorDomains : hosts,
        urlFilter: 'http://localhost:11434/*',
      }
    }, {
      id: 2,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          { header: 'Access-Control-Allow-Origin', operation: 'set', value: '*' },
          { header: 'Access-Control-Allow-Methods', operation: 'set', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { header: 'Access-Control-Allow-Headers', operation: 'set', value: '*' }
        ]
      },
      condition: {
        initiatorDomains : hosts,
        urlFilter: 'http://localhost:11434/*',
      }
    }]
  });
}
