import inquirer from 'inquirer';
import semver from 'semver';

interface BumpAnswers
{
    bump: 'major' | 'minor' | 'patch' | 'custom';
    custom: string;
    confirmed: boolean;
}

/**
 * Ask the user to do a version bump.
 * @param currentVersion - Current version to change from.
 * @returns The next version.
 */
export const bump = async (currentVersion: string): Promise<string> =>
{
    const { bump, custom, confirmed } = await inquirer.prompt<BumpAnswers>([{
        name: 'bump',
        type: 'list',
        message: `Release version (currently v${currentVersion}):`,
        choices: [
            { value: 'prerelease', name: `Prerelease (v${semver.inc(currentVersion, 'prerelease')})` },
            { value: 'patch', name: `Patch (v${semver.inc(currentVersion, 'patch')})` },
            { value: 'minor', name: `Minor (v${semver.inc(currentVersion, 'minor')})` },
            { value: 'major', name: `Major (v${semver.inc(currentVersion, 'major')})` },
            { value: 'custom', name: `Custom version` },
        ],
    }, {
        name: 'custom',
        type: 'input',
        message: 'What version? (e.g., 1.0.0)',
        when: (answers) => answers.bump === 'custom',
    }, {
        name: 'confirmed',
        type: 'confirm',
        default: false,
        message: ({ bump, custom }) =>
        {
            const nextVersion = bump === 'custom' ? custom : semver.inc(currentVersion, bump);

            return `Are you sure you want to release v${nextVersion}?`;
        },
    }]);

    if (!confirmed)
    {
        throw new Error(`Version bump cancelled.`);
    }

    const nextVersion = bump === 'custom' ? custom : semver.inc(currentVersion, bump);

    // Make sure the version is valid
    if (nextVersion === null || semver.valid(nextVersion) === null)
    {
        throw new Error(`Error: Invalid version: ${nextVersion}`);
    }

    // Make sure we are incrementing the version
    if (semver.lte(nextVersion, currentVersion))
    {
        throw new Error(`Error: Next version (v${nextVersion}) is less than current version (v${currentVersion}).`);
    }

    return nextVersion;
};
