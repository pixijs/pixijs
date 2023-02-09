import inquirer from 'inquirer';
import semver from 'semver';

/**
 * Ask the user to do a version bump.
 * @param currentVersion - Current version to change from.
 * @returns The next version.
 */
export const bump = async (currentVersion: string): Promise<string> =>
{
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
        throw new Error(`Error: Invalid version: ${nextVersion}`);
    }

    // Make sure we are incrementing the version
    if (semver.lt(nextVersion, currentVersion))
    {
        throw new Error(`Error: Next version (v${nextVersion}) is less than current version (v${currentVersion}).`);
    }

    return nextVersion;
};
