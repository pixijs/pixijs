import path from 'path';
import workspacesRun from 'workspaces-run';
import { readJSON, writeJSON } from './utils/json';

/** Before publish, let's replace all the relative file links with versions */
async function main()
{
    const { version } = await readJSON<{version: string}>(path.join(process.cwd(), 'package.json'));

    // Update all the packages with versions
    await workspacesRun({ cwd: process.cwd() }, async (workspace) =>
    {
        if (workspace.config.private) return;

        if (workspace.config.version)
        {
            console.error(
                `Error: ${workspace.dir}/package.json should not have a "version" property. `
                + `Remove it before publishing.`);

            process.exit(1);
        }
        workspace.config = {
            // Ensure the "version" property is placed right after the "name" property
            ...{ name: workspace.config.name, version },
            ...workspace.config,
        };

        bumpDependencies(workspace.config.dependencies, version);
        bumpDependencies(workspace.config.devDependencies, version);
        bumpDependencies(workspace.config.peerDependencies, version);

        await writeJSON(path.join(workspace.dir, 'package.json'), workspace.config);
    });
}

/**
 * Update the *dependencies in the package.json
 * @param dependencies - Dependencies map
 * @param version - Version to bump to
 */
function bumpDependencies(dependencies: Record<string, string> = {}, version: string)
{
    Object.keys(dependencies)
        // Only consider bumping monorepo packages
        .filter((n) => dependencies[n].startsWith('file:'))
        .forEach((n) =>
        {
            // replace with exact version
            dependencies[n] = version;
        });
}

main();
