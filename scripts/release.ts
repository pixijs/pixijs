import { execSync } from 'child_process';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import semver from 'semver';
import workspacesRun from 'workspaces-run';
import { spawn } from './utils/spawn';

// Read and write JSON from FS
const readJSON = async (file: string) => JSON.parse(await fs.promises.readFile(file, 'utf8'));
const writeJSON = (file: string, data: any) => fs.promises.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);

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

    const { bump, custom } = await inquirer.prompt<{bump: 'major' | 'minor' | 'patch' | 'custom', custom: string}>([{
        name: 'bump',
        type: 'list',
        message: `Release version (currently v${currentVersion}):`,
        choices: [
            { value: 'major', name: `Major (v${semver.inc(currentVersion, 'major')})` },
            { value: 'minor', name: `Minor (v${semver.inc(currentVersion, 'minor')})` },
            { value: 'patch', name: `Patch (v${semver.inc(currentVersion, 'patch')})` },
            { value: 'custom', name: `Custom version` },
        ],
    }, {
        name: 'custom',
        type: 'input',
        message: 'What version? (e.g., 1.0.0)',
        when: (answers) => answers.bump === 'custom',
    }]);

    const nextVersion = bump === 'custom' ? custom : semver.inc(currentVersion, bump as 'major' | 'minor' | 'patch');

    // Make sure the version is valid
    if (semver.valid(nextVersion) === null)
    {
        // eslint-disable-next-line no-console
        console.log(`Error: Invalid version: ${nextVersion}`);

        process.exit(1);
    }

    // Make sure we are incrementing the version
    if (semver.lt(nextVersion, currentVersion))
    {
        // eslint-disable-next-line no-console
        console.log(`Error: Next version (v${nextVersion}) is less than current version (v${currentVersion}).`);

        process.exit(1);
    }

    // Update the root version, we'll use in the future to track the latest version
    rootPackageInfo.version = nextVersion;
    await writeJSON(rootPackagePath, rootPackageInfo);

    // Update all the packages
    await workspacesRun({ cwd: process.cwd() }, async (workspace) =>
    {
        workspace.config.version = nextVersion;

        const { dependencies } = workspace.config;

        Object.keys(dependencies || {})
            .filter((n) => n.startsWith('@pixi'))
            .forEach((n) =>
            {
                dependencies[n] = nextVersion;
            });

        await writeJSON(path.join(workspace.dir, 'package.json'), workspace.config);
    });

    // Commit and tag the release
    await spawn('npm', ['install', '--package-lock-only']);
    await spawn('git', ['add', '-A']);
    await spawn('git', ['commit', '-m', `v${nextVersion}`]);
    // await spawn('git', ['tag', '-a', `v${nextVersion}`]);
    // await spawn('git', ['push']);
    // await spawn('git', ['push', '--tags']);
}

main();
