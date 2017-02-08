'use strict';

setBrowserClickAction();


function launch (options) {
  launchDevTools(options)
    .catch(function errorHandler (err) {
      alert(`Could not launch debugger.\n${err.message}`);
    });
}


chrome.runtime.onMessage.addListener(launch);


chrome.browserAction.onClicked.addListener(function onClick () {
  loadOptions(launch);
});
