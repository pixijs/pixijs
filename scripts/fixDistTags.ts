import { execSync } from 'child_process';
import workspacesRun from 'workspaces-run';
import rootPkg from '../package.json';

/**
 * In v8, we removed @pixi/* package from publishing
 * so in order to make sure that v7 users stay on the head of v7
 * we need to ensure that @pixi/* packages latest dist-tag is version
 * since we publish to the latest-7.x, and prerelease-7.x dist-tags
 */
async function main()
{
    await workspacesRun({ cwd: process.cwd(), orderByDeps: true }, async (pkg) =>
    {
        // Ignore pixi.js because this is published in v8 and we don't want to
        // overwrite the latest dist-tag
        if (!pkg.config.private && pkg.config.name !== 'pixi.js')
        {
            const cmd = `npm dist-tag add ${pkg.config.name}@${rootPkg.version} latest`;

            process.stdout.write(`${cmd} ... `);
            execSync(cmd, { stdio: 'inherit', env: process.env });
            process.stdout.write('done.\n');
        }
    });
}

main();
