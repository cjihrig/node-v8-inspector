'use strict';

document.addEventListener('DOMContentLoaded', function onLoad () {
  loadOptions(function loadCb (options) {
    host.value = options.host;
    host.placeholder = options.host;
    port.value = options.port;
    port.placeholder = options.port;
    defaults.checked = options.defaults;

    save.addEventListener('click', function onClick () {
      storeOptions({
        host: host.value,
        port: port.value,
        defaults: defaults.checked
      }, function storeCb () {
        setBrowserClickAction();
        // Update status to let user know options were saved.
        let status = document.getElementById('saveStatus');
        status.textContent = 'Options saved.';
        setTimeout(function() {
          status.textContent = 'Save';
        }, 750);
      });
    }, false);
  });
}, false);
