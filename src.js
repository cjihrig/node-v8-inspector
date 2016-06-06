document.addEventListener('DOMContentLoaded', function onLoad() {
  var launchButton = document.getElementById('launch');
  var portField = document.getElementById('port');
  var url = 'chrome-devtools://devtools/remote/serve_file/' +
            '@521e5b7e2b7cc66b4006a8a54cb9c4e57494a5ef/inspector.html' +
            '?experiments=true&v8only=true&ws=localhost:{PORT}/node';

  launchButton.addEventListener('click', function onClick() {
    var port = +portField.value || 5858;

    chrome.tabs.create({ url: url.replace('{PORT}', port) });
  }, false);
}, false);
