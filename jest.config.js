module.exports = {
    testPathIgnorePatterns: ['/node_modules/', '/src/', '/dist/', '/lib/'],
    preset: 'ts-jest/presets/js-with-ts',
    runner: 'jest-electron/runner',
    testEnvironment: 'jest-electron/environment',
    setupFilesAfterEnv: [
        'jest-extended/all',
    ],
    globalSetup: '<rootDir>/scripts/jest/jest-global-setup.ts',
    globalTeardown: '<rootDir>/scripts/jest/jest-global-teardown.ts',
    transform: {
        '\\.vert$': 'jest-raw-loader',
        '\\.frag$': 'jest-raw-loader',
        '\\.wgsl$': 'jest-raw-loader',
    },
    moduleNameMapper: {
        '^@pixi/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: ['**/?(*.)+(spec|tests|test).[tj]s?(x)'],
    snapshotResolver: '<rootDir>/scripts/jest/jest-snapshot-resolver.js',
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
        '<rootDir>/src/**/*.ts',
    ],
    coverageDirectory: '<rootDir>/dist/coverage',
};
