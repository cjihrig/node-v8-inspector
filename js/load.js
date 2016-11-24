'use strict';

setBrowserClickAction();

chrome.browserAction.onClicked.addListener(function onClick () {
  loadOptions(function loadCb (options) {
    launchDevTools(options)
      .catch(function errorHandler (err) {
        alert(`Could not launch debugger.\n${err.message}`);
      });
  });
});
