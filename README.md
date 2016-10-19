![node-v8-inspector](https://github.com/continuationlabs/node-v8-inspector/raw/master/logo128.png)

# node-v8-inspector

Chrome extension for launching V8 Inspector for Node.js debugging.

## Usage

1. Install the `node-v8-inspector` extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/nodejs-v8-inspector/lfnddfpljnhbneopljflpombpnkfhggl).
2. Run a Node.js application with the `--inspect` command line flag.
3. Open the `node-v8-inspector` extension in Chrome.
4. Verify that `host` and `port` match your application's host and debug port. The default value is 9229, the same default used by Node.js. The host defaults to `localhost`.
5. Press `Launch V8 Inspector` button.
6. Debug your application.
7. Profit (optional).
