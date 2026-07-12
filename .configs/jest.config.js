module.exports = {
    rootDir: '..',
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/lib/'],
    preset: 'ts-jest/presets/js-with-ts',
    runner: '@pixi/jest-electron/runner',
    testEnvironment: '@pixi/jest-electron/environment',
    setupFilesAfterEnv: [
        'jest-extended/all',
    ],
    globalSetup: '<rootDir>/scripts/jest/jest-global-setup.ts',
    globalTeardown: '<rootDir>/scripts/jest/jest-global-teardown.ts',
    transform: {
        // bundles worker entry files (imports included) before wrapping them as blob Workers;
        // the stock @pixi/webworker-plugins/lib/jest-transform breaks workers that have value imports
        '\\.worker.ts$': '<rootDir>/scripts/jest/jest-worker-transform.js',
        '\\.vert$': 'jest-raw-loader',
        '\\.frag$': 'jest-raw-loader',
        '\\.wgsl$': 'jest-raw-loader',
        '\\.js$': ['babel-jest', { plugins: ['@babel/plugin-transform-modules-commonjs'] }]
    },
    transformIgnorePatterns: ['/node_modules/(?!earcut|@types/earcut)'],
    moduleNameMapper: {
        '^worker:(.*)$': '$1',
        '^~/(.*)$': '<rootDir>/src/$1',
        '^@test-utils$': '<rootDir>/tests/utils/index.ts'
    },
    testMatch: ['**/?(*.)+(test)\\.ts'],
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
    testTimeout: 10000
};
