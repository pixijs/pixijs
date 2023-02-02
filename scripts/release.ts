import { execSync } from 'child_process';
import path from 'path';
import workspacesRun from 'workspaces-run';
import { bump } from './utils/bump';
import { readJSON, writeJSON } from './utils/json';
import { spawn } from './utils/spawn';

/**
 * Bump the version of all packages in the monorepo
 * and their dependencies. Replacement for lerna version --exact --force-publish
 */
async function main(): Promise<void>
{
    const status = execSync('git status --porcelain', {
        encoding: 'utf8',
        cwd: process.cwd(),
    });

    if (status.length > 0)
    {
        // eslint-disable-next-line no-console
        console.log('Error: You have uncommitted changes. Commit or stash them first.');

        process.exit(1);
    }

    const rootPackagePath = path.join(process.cwd(), 'package.json');
    const rootPackageInfo = await readJSON(rootPackagePath);
    const { version: currentVersion } = rootPackageInfo;

    let nextVersion: string;

    try
    {
        nextVersion = await bump(currentVersion);
    }
    catch (err)
    {
        // eslint-disable-next-line no-console
        console.error((err as Error).message);

        process.exit(1);
    }

    // Update the root version, we'll use in the future to track the latest version
    rootPackageInfo.version = nextVersion;
    await writeJSON(rootPackagePath, rootPackageInfo);

    // Update all the packages with versions
    await workspacesRun({ cwd: process.cwd() }, async (workspace) =>
    {
        workspace.config.version = nextVersion;

        bumpDependencies(workspace.config.dependencies, nextVersion);
        bumpDependencies(workspace.config.devDependencies, nextVersion);

        await writeJSON(path.join(workspace.dir, 'package.json'), workspace.config);
    });

    // Finish up: update lock, commit and tag the release
    // Having issues with npm@9 with package-lock-only, using latest 8 instead
    await spawn('npx', ['--yes', 'npm@8.19.3', 'install', '--package-lock-only']);
    await spawn('git', ['add', '-A']);
    await spawn('git', ['commit', '-m', `v${nextVersion}`]);
    await spawn('git', ['tag', '-a', `v${nextVersion}`, '-m', `v${nextVersion}`]);

    // For testing purposes
    if (!process.argv.includes('--no-push'))
    {
        await spawn('git', ['push']);
        await spawn('git', ['push', '--tags']);
    }
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
        .filter((n) => n.startsWith('@pixi') || n.startsWith('pixi.js'))
        .forEach((n) =>
        {
            // replace with exact version
            dependencies[n] = version;
        });
}

main();
