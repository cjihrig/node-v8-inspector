'use strict';

document.addEventListener('DOMContentLoaded', function onLoad () {
  let saveStatus = document.getElementById('saveStatus');

  function clearSaveStatus () {
    saveStatus.textContent = '';
  }

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
        saveStatus.textContent = 'Options saved.';
        setTimeout(clearSaveStatus, 750);
      });
    }, false);
  });
}, false);
