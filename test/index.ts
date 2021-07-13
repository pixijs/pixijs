import path from 'path';
import { execFileSync } from 'child_process';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import fs from 'fs';

import 'tsconfig-paths/register';

global.chai = chai;
global.sinon = sinon;
global.assert = chai.assert;
global.expect = chai.expect;

chai.use(sinonChai);

const requireAsStrings = (module, filename) =>
{
    module.exports = fs.readFileSync(filename, 'utf8');
};

// Handle fragment and vertex files as strings
require.extensions['.frag'] = requireAsStrings;
require.extensions['.vert'] = requireAsStrings;

// Synchronously generate the list of testable packages
const script = path.join(__dirname, './packages.ts');

const packagesBuffer = execFileSync('ts-node-transpile-only', [script]).toString();
const { availableSuites, locations } = JSON.parse(packagesBuffer);

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

for (const pkg of enabledSuites)
{
    fs.readdirSync(pkg)
        .filter((file) => file.endsWith('.tests.ts'))
        .map((file) => path.join(pkg, file))
        // eslint-disable-next-line global-require
        .forEach((file) => require(file));
}
