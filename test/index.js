const path = require('path');
const batchPackages = require('@lerna/batch-packages');
const filterPackages = require('@lerna/filter-packages');
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
    const filtered = filterPackages(packages);

    return batchPackages(filtered)
        .reduce((arr, batch) => arr.concat(batch), [])
        .filter((pkg) => !!pkg.scripts.test);
}

/**
 * Important: use Mocha as the entry point, inline async/await
 * functions will be ignored by floss as the root level
 * and all tests will be skipped.
 */
// eslint-disable-next-line func-names
describe('PIXI', function ()
{
    // eslint-disable-next-line func-names
    it('bootstrap all tests', async function ()
    {
        (await getSortedPackages()).forEach((pkg) =>
        {
            // eslint-disable-next-line global-require
            require(`${pkg.location}/test`);
        });
    });
});
