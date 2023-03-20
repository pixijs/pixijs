import path from 'path';
import workspacesRun from 'workspaces-run';
import { bumpDependencies } from './bumpDependencies';
import { readJSON, writeJSON } from './utils/json';

// copy version from package.json to sandbox CI bundles so npm pack command works
async function main()
{
    // eslint-disable-next-line no-console
    console.log('The GITHUB_SHA is: ', process.env.GITHUB_SHA);

    const { version } = await readJSON<{version: string}>(path.join(process.cwd(), 'package.json'));
    const { packages } = await readJSON<{packages: string[]}>(path.join(process.cwd(), '.codesandbox', 'ci.json'));

    const packageDirs = packages.map((relativeDir) => path.join(process.cwd(), relativeDir));

    // Update packages from codesandbox ci config with version
    await workspacesRun({ cwd: process.cwd() }, async (workspace) =>
    {
        if (!packageDirs.includes(workspace.dir) || workspace.config.private)
        {
            return;
        }

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

        // point dependency versions to their local codesandbox versions, weirdly they use a GH sha of length 8
        const baseUrl = `https://pkg.csb.dev/pixijs/pixijs/commit/${process.env.GITHUB_SHA.substr(0, 8)}/`;
        const getDependencyUrl = (packageName: string) => `${baseUrl}${packageName}`;

        bumpDependencies(workspace.config.dependencies, getDependencyUrl);
        bumpDependencies(workspace.config.devDependencies, getDependencyUrl);
        bumpDependencies(workspace.config.peerDependencies, getDependencyUrl);

        await writeJSON(path.join(workspace.dir, 'package.json'), workspace.config);
    });
}

main();
