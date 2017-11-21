const PackageUtilities = require('lerna/lib/PackageUtilities');
const Repository = require('lerna/lib/Repository');
const path = require('path');

// Standard Lerna plumbing getting packages
const repo = new Repository(path.dirname(__dirname));
const packages = PackageUtilities.getPackages(repo);

// Look for tests in the packages
packages.filter((pkg) => !!pkg.scripts.test).forEach((pkg) =>
{
    // eslint-disable-next-line global-require
    require(`${pkg.location}/test`);
});
