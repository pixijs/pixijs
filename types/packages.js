/* eslint-disable no-console */
const path = require('path');
const fs = require('fs-extra');
const { getPackages } = require('@lerna/project');
const { Extractor, ExtractorConfig, CompilerState } = require('@microsoft/api-extractor');
const chalk = require('chalk');
const glob = require('glob');
const batchPackages = require('@lerna/batch-packages');
const filterPackages = require('@lerna/filter-packages');

/**
 * Get a list of the non-private sorted packages with Lerna v3
 * @see https://github.com/lerna/lerna/issues/1848
 * @return {Promise<Package[]>} List of packages
 */

async function getSortedPackages(scope, ignore)
{
    const packages = await getPackages(__dirname);
    const filtered = filterPackages(
        packages,
        scope,
        ignore,
        false
    ).filter((pkg) => !pkg.get('standalone'))
        .filter((pkg) => pkg.get('types'));

    return batchPackages(filtered)
        .reduce((arr, batch) => arr.concat(batch), []);
}

main();

async function main()
{
    const baseDir = path.join(__dirname, '..');
    const packages = await getSortedPackages();

    /**
     * Represents the TypeScript compiler state.
     * This allows an optimization where multiple invocations can reuse the same compiler analysis.
     */
    let compilerState;

    // Share compiler state require load all entry points first.
    const entryPoints = packages.map((pkg) =>
    {
        const relative = path.relative(baseDir, pkg.location);

        return path.join(baseDir, 'dist', relative, 'src/index.d.ts');
    });

    // Patch for api-extractor not followed the declares of *.vert and *.frag in global.d.ts
    const strings = glob.sync('packages/**/*.{vert,frag}', { cwd: baseDir });

    await Promise.all(strings.map((file) =>
    {
        const target = path.join(baseDir, 'dist', `${file}.d.ts`);

        return fs.outputFile(target, `declare const content:string; export default content;`, 'utf8');
    }));

    entryPoints.push(path.join(baseDir, 'global.d.ts'));

    for (const pkg of packages)
    {
        const extractorConfigPath = path.join(pkg.location, 'api-extractor.json');

        const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);

        if (!compilerState)
        {
            compilerState = CompilerState.create(extractorConfig, {
                additionalEntryPoints: entryPoints,
            });
        }

        const result = Extractor.invoke(extractorConfig, {
            localBuild: true,
            showVerboseMessages: true,
            compilerState,
        });

        if (result.succeeded)
        {
            console.log(
                chalk.bold(chalk.green(`API Extractor completed successfully.`))
            );
        }
        else
        {
            console.error(
                `API Extractor completed with ${result.errorCount} errors`
              + ` and ${result.warningCount} warnings`
            );
            process.exitCode = 1;
        }
    }
}
