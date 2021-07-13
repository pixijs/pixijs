import path from 'path';
import fs from 'fs';
import batchPackages from '@lerna/batch-packages';
import { getPackages } from '@lerna/project';

/**
 * Get a list of the non-private sorted packages with Lerna v3
 * @see https://github.com/lerna/lerna/issues/1848
 * @return {Promise<Package[]>} List of packages
 */
async function getSortedPackages()
{
    // Standard Lerna plumbing getting packages
    const packages = await getPackages(path.dirname(__dirname));

    return batchPackages(packages)
        .reduce((arr, batch) => arr.concat(batch), []);
}

async function main()
{
    const buffer = [];
    const locations = {};

    (await getSortedPackages()).forEach((pkg) =>
    {
        locations[pkg.name] = pkg.location;
        buffer.push(`${pkg.location}/test`);
    });
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({
        availableSuites: buffer.filter(fs.existsSync),
        locations,
    }, null, '  '));
}

main();
