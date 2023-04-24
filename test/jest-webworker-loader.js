const tsJest = require('ts-jest');

module.exports = {
    process(sourceText, sourcePath, config, options)
    {
        const tsTransformer = tsJest.createTransformer();

        const transformedCode = tsTransformer.process(sourceText, sourcePath, config, options);

        return `
        const WORKER_CODE = ${JSON.stringify(transformedCode)};
        let WORKER_URL = null;
        class JestWorker extends Worker
        {
            constructor()
            {
                if (!WORKER_URL)
                {
                    WORKER_URL = URL.createObjectURL(new Blob([WORKER_CODE], { type: 'application/javascript' }));
                }
                super(WORKER_URL);
            }
            static revokeObjectURL()
            {
                if (WORKER_URL)
                {
                    URL.revokeObjectURL(WORKER_URL);
                    WORKER_URL = null;
                }
            }
        }
        module.exports = JestWorker;
        `;
    }
};
