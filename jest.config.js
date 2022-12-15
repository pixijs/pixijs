module.exports = {
    testPathIgnorePatterns: ['/node_modules/', '/src/', '/dist/', '/lib/', '/out/', '/bundles/'],
    runner: '@kayahr/jest-electron-runner',
    testEnvironment: '@kayahr/jest-electron-runner/environment',
    setupFilesAfterEnv: [
        'jest-extended/all',
    ],
    globalSetup: '<rootDir>/test/jest-global-setup.ts',
    globalTeardown: '<rootDir>/test/jest-global-teardown.ts',
    transform: {
        '\\.(vert|frag)$': '<rootDir>/test/transform-raw-loader.js',
        '^.+\\.ts$': ['ts-jest', { isolatedModules: true }],
    },
    moduleNameMapper: {
        '^@pixi/(.*)$': '<rootDir>/packages/$1/src',
    },
    testMatch: ['**/test/*.tests.ts'],
    collectCoverageFrom: [
        '<rootDir>/packages/**/*.ts',
        '!<rootDir>/packages/**/*.d.ts'
    ],
    coverageDirectory: '<rootDir>/dist/coverage',
};
