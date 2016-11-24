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
      });
    }, false);
  });
}, false);
