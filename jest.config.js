module.exports = {
    testPathIgnorePatterns: ['/node_modules/', '/src/', '/dist/', '/lib/', '/out/', '/bundles/'],
    preset: 'ts-jest/presets/js-with-ts',
    runner: 'jest-electron/runner',
    testEnvironment: 'jest-electron/environment',
    setupFilesAfterEnv: [
        'jest-extended/all',
    ],
    globalSetup: '<rootDir>/test/jest-global-setup.ts',
    globalTeardown: '<rootDir>/test/jest-global-teardown.ts',
    transform: {
        '\\.vert$': 'jest-raw-loader',
        '\\.frag$': 'jest-raw-loader',
    },
    moduleNameMapper: {
        '^@pixi/(?!colord)(.*)$': '<rootDir>/packages/$1/src',
    },
    testMatch: ['**/?(*.)+(spec|tests).[tj]s?(x)'],
    snapshotResolver: '<rootDir>/test/jest-snapshot-resolver.js',
    globals: {
        'ts-jest': {
            tsconfig: {
                module: 'ESNext',
                esModuleInterop: true,
            },
            diagnostics: false,
        },
    },
    collectCoverageFrom: [
        '<rootDir>/packages/**/*.ts',
        '!<rootDir>/packages/**/*.d.ts',
        '!<rootDir>/packages/polyfill/**/*.ts',
    ],
    coverageDirectory: '<rootDir>/dist/coverage',
};
