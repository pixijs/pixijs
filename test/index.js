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
const { availableSuites, locations } = JSON.parse(execFileSync('node', [script]).toString());

// Filter any packages from the commandline options
const onlyPackages = global.options.args
    .filter((arg) => arg.startsWith('--package='))
    .map((arg) => arg.replace('--package=', ''));

// Filter the tests in case we have options to narrow scope
const enabledSuites = !onlyPackages.length ? availableSuites
    : availableSuites.filter((pkg) => onlyPackages.some((p) => pkg.startsWith(locations[p])));

if (!enabledSuites.length)
{
    const invalidNames = onlyPackages.filter((pkg) => !locations[pkg]);

    // eslint-disable-next-line no-console
    console.log(`WARNING: Invalid package name${invalidNames.length > 1 ? 's' : ''}:`, `"${invalidNames.join('", "')}"`);
}

// eslint-disable-next-line global-require
enabledSuites.forEach((pkg) => require(pkg));
