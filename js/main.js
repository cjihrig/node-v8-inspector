'use strict';

document.addEventListener('DOMContentLoaded', function onLoad() {
  loadOptions(function loadCb (options) {
    host.value = options.host;
    host.placeholder = options.host;
    port.value = options.port;
    port.placeholder = options.port;

    launch.addEventListener('click', function onClick() {
      const settings = {
        host: host.value,
        port: port.value,
        poll: options.poll
      };

      if (options.poll === true) {
        // If polling mode is enabled, send the work to the background page.
        window.close();
        chrome.runtime.sendMessage(settings);
      } else {
        error.style.display = 'none';

        launchDevTools(settings)
          .catch(function errorHandler (err) {
            error.innerHTML = `Could not launch debugger<br>${err.message}`;
            error.style.display = 'block';
          });
      }
    }, false);
  });
}, false);
