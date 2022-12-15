module.exports = {
    testPathIgnorePatterns: ['/node_modules/', '/src/', '/dist/', '/lib/'],
    preset: 'ts-jest',
    setupFilesAfterEnv: [
        'jest-extended/all',
    ],
    transform: {
        '\\.(vert|frag)$': '<rootDir>/../../test/transform-raw-loader.js',
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
