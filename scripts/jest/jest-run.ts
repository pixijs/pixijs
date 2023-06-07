import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import parse from 'yargs-parser';
// Support for the tsconfig path aliasing
import 'tsconfig-paths/register';

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

const packages: {name: string, location: string}[] = [];

fs.readdirSync(path.resolve(process.cwd(), 'tests')).forEach((folder) =>
{
    const packagePath = path.resolve(process.cwd(), 'tests', folder);

    // check if it is a folder
    if (fs.lstatSync(packagePath).isDirectory())
    {
        packages.push({ name: path.basename(folder), location: packagePath });
    }
});

// Filter any packages from the commandline options
const onlyPackages = args.packages as string[] || [];

// Filter the tests in case we have options to narrow scope
const scopedPackages = !onlyPackages.length ? packages
    : packages.filter((pkg) => onlyPackages.some((name) => pkg.name === name));

if (!scopedPackages.length)
{
    // Find any invalid package names
    const invalidNames = onlyPackages.filter((name) => !packages.some((pkg) => pkg.name === name));

    // eslint-disable-next-line no-console
    console.log(`WARNING: Invalid package name${invalidNames.length > 1 ? 's' : ''}:`, `"${invalidNames.join('", "')}"`);
}

const tests = scopedPackages.map((pkg) => pkg.location).join(' ');
const out = exec(`jest ${tests} --colors`);

out.stdout?.pipe(process.stdout);
out.stderr?.pipe(process.stderr);
