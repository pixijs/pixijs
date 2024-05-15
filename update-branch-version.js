/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-var-requires */
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const args = require("minimist")(process.argv.slice(2));

const version = args["version"];

console.log("version: ", version);

const runCommand = async (command) => {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
        });
    });
};

/**
 * @NOTE: This can't be done by only using the workflow, because when we try to update
 * the version to the desired version, we get an error about wrong version format,
 * but directly on CI it works as expected.
 */
const UpdateBranchVersion = async () => {
    // update the release candidate version on package.json
    const { error } = await runCommand(`npm version ${version}`);

    if (error) {
        console.error(error);
        return;
    }

    // the release candidate version is already updated on package.json on the next line
    console.log("Next Release Candidate version: ", `${version}`);
};

UpdateBranchVersion();
