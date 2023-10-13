const tsJest = require('ts-jest');
const webworkerLoader = require('../scripts/webworker-loader.js');

module.exports = {
    process(sourceText, sourcePath, config, options)
    {
        const tsTransformer = tsJest.createTransformer();

        const transformedCode = tsTransformer.process(sourceText, sourcePath, config, options);

        return webworkerLoader.generateCode(transformedCode, 'cjs');
    }
};
