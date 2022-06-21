module.exports = {
    testPathIgnorePatterns: ['/node_modules/', '/src/', '/dist/', '/lib/'],
    preset: 'ts-jest/presets/js-with-ts',
    runner: 'jest-electron/runner',
    testEnvironment: 'jest-electron/environment',
    setupFilesAfterEnv: [
        'jest-extended/all',
    ],
    transform: {
        '\\.vert$': 'jest-raw-loader',
        '\\.frag$': 'jest-raw-loader',
    },
    moduleNameMapper: {
        '^@pixi/(.*)$': '<rootDir>/packages/$1/src',
    },
    testMatch: ['**/?(*.)+(spec|tests).[tj]s?(x)'],
    globals: {
        'ts-jest': {
            tsconfig: {
                module: 'ESNext',
                esModuleInterop: true,
            },
            diagnostics: {
                warnOnly: true,
            },
        },
    },
    collectCoverageFrom: [
        '<rootDir>/packages/**/*.ts',
        '!<rootDir>/packages/**/*.d.ts',
        '!<rootDir>/packages/polyfill/**/*.ts',
    ],
    coverageDirectory: '<rootDir>/dist/coverage',
};
