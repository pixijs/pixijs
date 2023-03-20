import path from 'path';
import workspacesRun from 'workspaces-run';
import { readJSON, writeJSON } from './utils/json';
import { bumpDependencies } from './bumpDependencies';

/** Before publish, let's replace all the relative file links with versions */
async function main()
{
    const { version } = await readJSON<{version: string}>(path.join(process.cwd(), 'package.json'));

    // Update all the packages with versions
    await workspacesRun({ cwd: process.cwd() }, async (workspace) =>
    {
        if (workspace.config.private) return;

        if ('version' in workspace.config)
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

main();
