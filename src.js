'use strict';

const defaultHost = 'localhost';
const defaultPort = 9229;

document.addEventListener('DOMContentLoaded', function onLoad() {

  launch.addEventListener('click', function onClick() {
    const hostValue = host.value || defaultHost;
    const portValue = +port.value || defaultPort;
    const jsonUrl = `http://${hostValue}:${portValue}/json/list`;
    error.style.display = 'none';
    fetch(jsonUrl)
      .then(function parseJson (response) {
        if (response.status !== 200) {
          throw new Error(`Invalid configuration data at ${jsonUrl}`);
        }

        return response.json();
      })
      .then(function getIds (data) {
        try {
          const hash = data[0].devtoolsFrontendUrl.match(/\/(@\w+)\//)[1];
          let path = data[0].id;

          // Node v6.9.0 added a UUID for security purposes. Prior to that,
          // this was just a number, and the path was "node".
          if (path.indexOf('-') === -1) {
            path = 'node';
          }

          return { hash, path };
        } catch (err) {
          throw new Error(
            `Invalid devtools URL in ${JSON.stringify(data, null, 2)}`
          );
        }
      })
      .then(function openInspector (ids) {
        const url = `chrome-devtools://devtools/remote/serve_file/` +
                    `${ids.hash}/inspector.html` +
                    `?experiments=true&v8only=true` +
                    `&ws=${hostValue}:${portValue}/${ids.path}`;

        chrome.tabs.create({active: false}, (tab) => {
            chrome.tabs.update(tab.id, {url, active:true});
        });
      })
      .catch(function errorHandler (err) {
        error.innerHTML = `Could not launch debugger<br>${err.message}`;
        error.style.display = 'block';
      });
  }, false);
}, false);
