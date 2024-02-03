const libraries = {
    inlinedLibraries: [
        '@pixi/colord',
        'earcut',
        'eventemitter3',
    ],
};

const output = {
    inlineDeclareGlobals: true,
    exportReferencedTypes: false,
    umdModuleName: 'PIXI',
};

const config = {
    compilationOptions: {
        preferredConfigPath: './tsconfig.json',
    },
    entries: [
        {
            filePath: './bundles/pixi.js/src/typings.d.ts',
            outFile: './bundles/pixi.js/dist/pixi.d.ts',
            libraries,
            output,
        },
        {
            filePath: './bundles/pixi.js-legacy/src/typings.d.ts',
            outFile: './bundles/pixi.js-legacy/dist/pixi-legacy.d.ts',
            libraries,
            output,
        },
    ],

};

module.exports = config;
