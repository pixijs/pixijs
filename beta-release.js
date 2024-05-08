/* eslint-disable @typescript-eslint/no-var-requires */
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const packageJson = require("./package.json");

const args = require("minimist")(process.argv.slice(2));

const issueNumber = args["issue"];

console.log(issueNumber);

const runCommand = async (command) => {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
        });
    });
};

const AutoBetaRelease = async () => {
    // get all the versions of the package from npm
    const { stdout } = await runCommand(`npm view . versions --json`);

    // show npm published versions of this package
    console.log(stdout);

    // check if there is a beta release with the same issue number on published versions
    const arrayOfBetaReleases = JSON.parse(stdout).filter((version) =>
        version.includes(`${packageJson.version}-beta.${issueNumber}`)
    );

    let fullLastBetaRelease = null;

    // if yes, get the latest beta release. Output: 1.0.0-beta.1.rc.0
    if (arrayOfBetaReleases.length) {
        fullLastBetaRelease =
            arrayOfBetaReleases[arrayOfBetaReleases.length - 1];
    }

    console.log("Last Beta Release: ", fullLastBetaRelease);

    let nextBetaReleaseVersion = 0;

    if (fullLastBetaRelease) {
        const lastBetaReleaseRCVersionArray =
            fullLastBetaRelease.match(/rc.+[0-9]+/g);

        const lastBetaReleaseRCVersion =
            lastBetaReleaseRCVersionArray &&
            lastBetaReleaseRCVersionArray.length
                ? lastBetaReleaseRCVersionArray[0]
                : null;

        const lastBetaReleaseVersion = lastBetaReleaseRCVersion
            ? lastBetaReleaseRCVersion.split(".")[1]
            : 0;

        nextBetaReleaseVersion = parseInt(lastBetaReleaseVersion, 10) + 1;
    }

    // next beta release version. Output: 1.0.0-beta.1.rc.1
    const nextBetaReleaseVesionFull = `${packageJson.version}-beta.${issueNumber}.rc.${nextBetaReleaseVersion}`;

    // update the beta version on packageJson.json
    const { error } = await runCommand(
        `npm version ${nextBetaReleaseVesionFull} --no-git-tag-version`
    );

    if (error) {
        console.error(error);
        return;
    }

    // the beta version is already updated on package.json on the next line
    console.log("Next Beta version: ", `${nextBetaReleaseVesionFull}`);

    await runCommand(
        `echo "NEW_VERSION=${nextBetaReleaseVesionFull}" >> $GITHUB_ENV`
    );
};

AutoBetaRelease();
