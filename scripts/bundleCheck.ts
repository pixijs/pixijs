/* eslint-disable no-console */
import fs, { promises } from 'fs';
import path from 'path';

/**
 * The goal of this script is to look at the main export for each package
 * and determine if there are any packages that are getting bundled that
 * shouldn't be. Occassionally a @pixi/* package will be missing
 * from the list of dependencies or peerDependencies.
 */
const main = async () =>
{
    let errorFound = false;
    const rootPath = path.resolve(__dirname, '..');
    const packages = await promises.readdir(path.join(rootPath, 'packages'));

    for (const pkg of packages)
    {
        const pkgPath = path.join(rootPath, 'packages', pkg);
        const pkgFile = path.join(pkgPath, 'package.json');
        const { name, main } = JSON.parse(await promises.readFile(pkgFile, 'utf8'));
        const mainFile = path.join(pkgPath, main);

        if (!fs.existsSync(mainFile))
        {
            console.log('ERROR: Unable to check bundles, please build first.');
            process.exit(1);
        }

        const buffer = await promises.readFile(mainFile, 'utf8');
        const bundledPackages = buffer.match(/ \* @pixi\/.+ - v.+/g);

        if (bundledPackages?.length > 1)
        {
            console.log(`ERROR: ${name}`, 'contains:');
            bundledPackages
                .map((p) => p.slice(3, p.lastIndexOf(' -')))
                .filter((p) => p !== name)
                .forEach((p) => console.log(`  - ${p}`));
            console.log();
            errorFound = true;
        }
    }
    if (errorFound)
    {
        process.exit(1);
    }
    else
    {
        console.log('No bundling errors found.');
        process.exit(0);
    }
};

main();
