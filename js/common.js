'use strict';

const defaultHost = 'localhost';
const defaultPort = 9229;
const launchDefaults = false;


function storeOptions (options, callback) {
  const settings = Object.assign({
    host: defaultHost,
    port: defaultPort,
    defaults: launchDefaults
  }, options);

  chrome.storage.sync.set(settings, callback);
}


function loadOptions (callback) {
  chrome.storage.sync.get({
    host: defaultHost,
    port: defaultPort,
    defaults: launchDefaults
  }, callback);
}


function setBrowserClickAction () {
  loadOptions(function loadCb (options) {
    if (options.defaults === true) {
      chrome.browserAction.setPopup({ popup: '' });
    } else {
      chrome.browserAction.setPopup({ popup: 'index.html' });
    }
  });
}


function launchDevTools (options) {
  const jsonUrl = `http://${options.host}:${options.port}/json/list`;

  return fetch(jsonUrl)
    .then(function parseJson (response) {
      if (response.status !== 200) {
        throw new Error(`Invalid configuration data at ${jsonUrl}`);
      }

      return response.json();
    })
    .then(function openInspector (data) {
      // The replace is for older versions. For newer versions, it is a no-op.
      const devtoolsFrontendUrl = data[0].devtoolsFrontendUrl.replace(
        /^https:\/\/chrome-devtools-frontend\.appspot\.com/i,
        'chrome-devtools://devtools/remote'
      );

      const url = new URL(devtoolsFrontendUrl);
      const wsUrl = new URL(data[0].webSocketDebuggerUrl);

      // Update the WebSocket URL with the host and port options. Then, update
      // the DevTools URL with the new WebSocket URL. Also strip the protocol.
      wsUrl.hostname = options.host;
      wsUrl.port = options.port;
      url.searchParams.set('ws', wsUrl.toString().replace('ws://', ''));

      chrome.tabs.create({
        // Without decoding 'ws', DevTools won't load the source files properly.
        url: decodeURIComponent(url.toString())
      });
    });
}
