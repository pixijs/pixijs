module.exports = {
    testPathIgnorePatterns: ['/node_modules/', '/src/', '/dist/', '/lib/'],
    setupFilesAfterEnv: [
        'jest-extended/all',
    ],
    transform: {
        '\\.(vert|frag)$': '<rootDir>/../../test/transform-raw-loader.js',
        '^.+\\.ts$': ['ts-jest', { isolatedModules: true }],
    },
    moduleNameMapper: {
        '^@pixi/node$': '<rootDir>/src',
        '^@pixi/(.*)$': '<rootDir>/../../packages/$1/src',
    },
    testMatch: ['<rootDir>/test/*.tests.ts'],
    collectCoverageFrom: [
        '<rootDir>/**/*.ts',
    ],
    coverageDirectory: '<rootDir>/../../dist/coverage-node',
};
