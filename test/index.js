const path = require('path');
const { execFileSync } = require('child_process');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

global.chai = chai;
global.sinon = sinon;
global.should = chai.should;
global.assert = chai.assert;
global.expect = chai.expect;
global.chai.use(sinonChai);

// Synchronously generate the list of testable packages
const script = path.join(__dirname, './packages.js');
const packages = execFileSync('node', [script]).toString();

// Require the test
// eslint-disable-next-line global-require
JSON.parse(packages).forEach((pkg) => require(pkg));
