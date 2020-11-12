const lernaProject = require('@lerna/project');
const batchPackages = require('@lerna/batch-packages');
const filterPackages =  require('@lerna/filter-packages');
const path = require('path');
const fs = require('fs');

async function getSortedPackages()
{
    const packages = await lernaProject.getPackages(process.cwd());

    const filtered = filterPackages(packages, undefined, undefined, false);

    return batchPackages(filtered)
        .reduce((arr, batch) => arr.concat(batch), []);
}

async function start()
{
    const packages = await getSortedPackages();

    packages.forEach((pkg) =>
    {
        const basePath = path.relative(process.cwd(), pkg.location);

        const globalDtsPath = path.resolve(basePath, './global.d.ts');

        if (fs.existsSync(globalDtsPath))
        {
            const indexDtsPath = path.resolve(basePath, './index.d.ts');
            const globalDtsFile = fs.readFileSync(globalDtsPath, {
                encoding: 'utf8'
            });

            const wrapper = `${globalDtsFile.replace('declare', 'declare global {')}}`;

            fs.appendFileSync(indexDtsPath, wrapper);
        }
    });
}

start();
