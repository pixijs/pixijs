const path = require('path');
const { execFileSync } = require('child_process');

// Synchronously generate the list of testable packages
const script = path.join(__dirname, './packages.js');
const packages = execFileSync('node', [script]).toString();

// Require the test
// eslint-disable-next-line global-require
JSON.parse(packages).forEach((pkg) => require(pkg));
