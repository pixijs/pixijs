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

interface PackageResult {
    name: string;
    location: string;
    tests: string;
    available: boolean;
}

async function main()
{
    const packages: PackageResult[] = (await getSortedPackages()).map((pkg) =>
    {
        const tests = path.join(pkg.location, 'test');
        const available = fs.existsSync(tests);

        return {
            name: pkg.name,
            location: pkg.location,
            tests,
            available,
        };
    });

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(packages, null, '  '));
}

main();

export type { PackageResult };
