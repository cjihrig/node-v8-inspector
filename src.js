'use strict';

document.addEventListener('DOMContentLoaded', function onLoad() {
  const launchButton = document.getElementById('launch');
  const portField = document.getElementById('port');

  launchButton.addEventListener('click', function onClick() {
    const port = +portField.value || 5858;
    const jsonUrl = `http://localhost:${port}/json/list`;

    fetch(jsonUrl)
      .then(function parseJson (response) {
        if (response.status !== 200) {
          throw new Error(`Invalid configuration data at ${jsonUrl}`);
        }

        return response.json();
      })
      .then(function getId (data) {
        try {
          return data[0].devtoolsFrontendUrl.match(/\/(@\w+)\//)[1];
        } catch (err) {
          throw new Error(
            `Invalid devtools URL in ${JSON.stringify(data, null, 2)}`
          );
        }
      })
      .then(function openInspector (id) {
        const url = `chrome-devtools://devtools/remote/serve_file/` +
                    `${id}/inspector.html` +
                    `?experiments=true&v8only=true&ws=localhost:${port}/node`;

        chrome.tabs.create({ url });
      })
      .catch(function errorHandler (err) {
        msg.innerHTML = `Could not launch debugger<br>${err.message}`;
      });
  }, false);
}, false);
