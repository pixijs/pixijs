const lerna = require('../lerna');
const glob = require('glob');
const path = require('path');

let tests = [];

// Locate all test files and convert to paths
lerna.packages.forEach((p) =>
{
    tests = tests.concat(glob.sync(`${p}/test/index.js`).map((f) =>
        path.join(__dirname, '..', f)
    ));
});

// Import tests
// eslint-disable-next-line global-require
tests.forEach((test) => require(test));
