const libraries = {
    inlinedLibraries: [
        '@pixi/colord',
        'earcut',
    ],
};

const output = {
    inlineDeclareGlobals: true,
    exportReferencedTypes: false,
    umdModuleName: 'PIXI',
};

const config = {
    compilationOptions: {
        preferredConfigPath: '../tsconfig.json',
    },
    entries: [
        {
            filePath: '../lib/index.d.ts',
            outFile: '../dist/pixi.js.d.ts',
            libraries,
            output,
        },
    ],

};

module.exports = config;
