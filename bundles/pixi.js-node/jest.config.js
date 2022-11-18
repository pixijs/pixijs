module.exports = {
    testPathIgnorePatterns: ['/node_modules/', '/src/', '/dist/', '/lib/', '/out/'],
    preset: 'ts-jest/presets/js-with-ts',
    setupFilesAfterEnv: [
        'jest-extended/all',
    ],
    transform: {
        '\\.vert$': 'jest-raw-loader',
        '\\.frag$': 'jest-raw-loader',
    },
    moduleNameMapper: {
        '^@pixi/node$': '<rootDir>/src',
        '^@pixi/(.*)$': '<rootDir>/../../packages/$1/src',
    },
    testMatch: ['**/?(*.)+(spec|tests).[tj]s?(x)'],
    globals: {
        'ts-jest': {
            tsconfig: {
                module: 'ESNext',
                esModuleInterop: true,
            },
            diagnostics: false,
        },
    },
};
