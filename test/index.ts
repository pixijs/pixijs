import { exec, execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import parse from 'yargs-parser';
// Support for the tsconfig path aliasing
import 'tsconfig-paths/register';

import type { PackageResult } from './packages';

const args = parse(process.argv, {
    array: ['packages']
});

const requireAsStrings = (module: any, filename: string) =>
{
    module.exports = fs.readFileSync(filename, 'utf8');
};

// Handle fragment and vertex files as strings
require.extensions['.frag'] = requireAsStrings;
require.extensions['.vert'] = requireAsStrings;

// Synchronously generate the list of testable packages
const script = path.join(__dirname, './packages.ts');

const isWin = (/^win/).test(process.platform);
const cmd = `ts-node-transpile-only${isWin ? '.cmd' : ''}`;
const packagesBuffer = execFileSync(cmd, [script]).toString();
const packages = JSON.parse(packagesBuffer) as PackageResult[];

// Filter any packages from the commandline options
const onlyPackages = args.packages as string[] || [];

// Filter the tests in case we have options to narrow scope
const scopedPackages = !onlyPackages.length ? packages
    : packages.filter((pkg) => onlyPackages.some((name) => pkg.name === name));

// Ignore packages without tests suites
const availableSuites = scopedPackages.filter((pkg) => pkg.available);

if (!availableSuites.length)
{
    // Find any invalid package names
    const invalidNames = onlyPackages.filter((name) => !packages.some((pkg) => pkg.name === name));

    // eslint-disable-next-line no-console
    console.log(`WARNING: Invalid package name${invalidNames.length > 1 ? 's' : ''}:`, `"${invalidNames.join('", "')}"`);
}

const tests = availableSuites.map((pkg) => pkg.tests).join(' ');
const out = exec(`jest ${tests} --colors`);

out.stdout?.pipe(process.stdout);
out.stderr?.pipe(process.stderr);
