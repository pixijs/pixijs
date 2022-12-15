module.exports = {
    testPathIgnorePatterns: ['/node_modules/', '/src/', '/dist/', '/lib/', '/out/', '/bundles/'],
    preset: 'ts-jest',
    runner: '@kayahr/jest-electron-runner',
    testEnvironment: '@kayahr/jest-electron-runner/environment',
    setupFilesAfterEnv: [
        'jest-extended/all',
    ],
    globalSetup: '<rootDir>/test/jest-global-setup.ts',
    globalTeardown: '<rootDir>/test/jest-global-teardown.ts',
    transform: {
        '\\.vert$': '<rootDir>/test/transform-raw-loader.js',
        '\\.frag$': '<rootDir>/test/transform-raw-loader.js',
    },
    moduleNameMapper: {
        '^@pixi/(.*)$': '<rootDir>/packages/$1/src',
    },
    testMatch: ['**/?(*.)+(spec|tests).ts'],
    collectCoverageFrom: [
        '<rootDir>/packages/**/*.ts',
        '!<rootDir>/packages/**/*.d.ts'
    ],
    coverageDirectory: '<rootDir>/dist/coverage',
};
