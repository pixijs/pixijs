const path = require('path');
const fs = require('fs');
const batchPackages = require('@lerna/batch-packages');
const { getPackages } = require('@lerna/project');

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

    (await getSortedPackages()).forEach((pkg) =>
    {
        buffer.push(`${pkg.location}/test`);
    });
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(buffer.filter(fs.existsSync)));
}

main();
