#!/usr/bin/env node

// require = require('esm')(module /*, options*/);
// require('../src/cli').cli(process.argv);

const wrs = require('../dist/webdriver-session');

wrs.getChromeSessionId();
