'use strict';

const defaultHost = 'localhost';
const defaultPort = 9229;
const defaultPoll = false;
const launchDefaults = false;
const notificationId = 'pollForDevTools';
const interval = 500;
let openedInspectorTab = null;
let notificationActive = false;
let timeoutId;


function storeOptions (options, callback) {
  const settings = Object.assign({
    host: defaultHost,
    port: defaultPort,
    poll: defaultPoll,
    defaults: launchDefaults
  }, options);

  chrome.storage.sync.set(settings, callback);
}


function loadOptions (callback) {
  chrome.storage.sync.get({
    host: defaultHost,
    port: defaultPort,
    poll: defaultPoll,
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


function parseJson (response) {
  if (response.status !== 200) {
    throw new Error(`Invalid configuration data at ${response.url}`);
  }

  return response.json();
}


function openInspectorTab (data, options) {
  return new Promise((resolve, reject) => {
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
    }, function onTabCreated(tab) {
      openedInspectorTab = tab;
      resolve(openedInspectorTab);
    });
  });
}


function closeInspectorTab () {
  if (openedInspectorTab) {
    // No callback, clear flag in chrome.tabs.onRemoved().
    chrome.tabs.remove(openedInspectorTab.id);
  }
}


function addNotification () {
  if (!notificationActive) {
    chrome.notifications.create(notificationId,  {
      type: 'basic',
      title: 'Node.js V8 Inspector',
      message: 'Polling for debug server. Dismiss to stop polling.',
      isClickable: true,
      requireInteraction: true,
      iconUrl: 'images/logo32.png'
    }, function onNotificationCreated () {
      notificationActive = true;
    });
  }
}


function removeNotification () {
  if (notificationActive) {
    // No callback. Reset the flag in the onClosed listener.
    chrome.notifications.clear(notificationId);
  }
}


// Promise an openInspectorTab or reject if the devtools is not open.
function openDevTools (options) {
  const jsonUrl = `http://${options.host}:${options.port}/json/list`;

  return fetch(jsonUrl)
    .then(function startedDebugging (response) {
      return parseJson(response)
        .then(function onJson (data) {
          // Server is active, do we need to openInspector?
          if (!openedInspectorTab) {
            return openInspectorTab(data, options);
          } else {
            return Promise.resolve(openInspectorTab);
          }
        });
    });
}


// Polling user experience loop: notification, poll, openInspector, repeat.
function pollForDevTools (options) {
  // If already polling, do not start again.
  if (timeoutId) {
    return Promise.resolve('polling');
  }

  let tabIdOpenedByPolling = null;

  timeoutId = setInterval(() => {
    // Fetch every time and open inspector only if it is not open.
    openDevTools(options)
      .then(function readyForDebugging (openInspectorTab) {
        // If the inspector was opened, remove the notification.
        if (openInspectorTab) {
          removeNotification();
          // Remember which tab was opened.
          tabIdOpenedByPolling = openedInspectorTab.id
        }
      })
      .catch(function noAnswer () {
        // Server is not active. Assume the session is over.
        // Forget out tabId first, so we don't stop polling.
        tabIdOpenedByPolling = null;
        closeInspectorTab();
        // Tell the user we are ready for another session.
        addNotification();
      });
  }, interval);

  // If polling opened the inspector, stop polling on close.
  chrome.tabs.onRemoved.addListener(function onTabsRemoved (tabId) {
    if (tabIdOpenedByPolling && tabId === tabIdOpenedByPolling) {
      if (timeoutId) {
        clearInterval(timeoutId);
        timeoutId = null;
      }

      tabIdOpenedByPolling = null;
    }
  });

  return Promise.resolve('polling');
}


function launchDevTools (options) {
  if (options.poll) {
    return pollForDevTools(options);
  }

  return openDevTools(options);
}


chrome.tabs.onRemoved.addListener(function onTabsRemoved (tabId) {
  if (openedInspectorTab && tabId === openedInspectorTab.id) {
    openedInspectorTab = null;
  }
});


chrome.notifications.onClosed.addListener(function onNotificationCleared () {
  notificationActive = false;
});


// If the user is done debugging, stop polling.
chrome.notifications.onClicked.addListener(function onNotificationClicked (id) {
  if (id === notificationId) {
    clearInterval(timeoutId);
    timeoutId = null;
    removeNotification();
  }
});
