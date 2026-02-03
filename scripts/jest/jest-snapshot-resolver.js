// TODO: Convert this file to TypeScript when we upgrade Jest in the future.
// Jest supports TypeScript snapshot resolver since 27.0.0 (See https://github.com/facebook/jest/pull/8829),
// but unfortunately our Jest version is locked to 26 due to the limitation of jest-electron.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { basename, dirname, join } = require('path');

module.exports = {
    resolveSnapshotPath: (testPath, snapshotExtension) =>
        join(
            dirname(testPath),
            'snapshots',
            basename(testPath) + snapshotExtension,
        ),
    resolveTestPath: (snapshotPath, snapshotExtension) =>
        join(
            dirname(snapshotPath),
            '..',
            basename(snapshotPath, snapshotExtension),
        ),
    testPathForConsistencyCheck: join('src', 'core', 'test', 'Example.tests.ts'),
};
