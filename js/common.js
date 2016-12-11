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
      let devtoolsFrontendUrl = data && data[0] && data[0].devtoolsFrontendUrl;
      if (typeof devtoolsFrontendUrl !== 'string') {
        throw new Error('Not found devtools front-end url');
      }
      if (options.host !== 'localhost') {
        devtoolsFrontendUrl = devtoolsFrontendUrl.replace(/ws=localhost:\d+/g,
          `ws=${options.host}:${options.port}`);
      }
      chrome.tabs.create({ url: devtoolsFrontendUrl });
    });
}
