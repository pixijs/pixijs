module.exports = {
    generateCode(source, moduleType)
    {
        let result = `\
const WORKER_CODE = ${JSON.stringify(source)};
let WORKER_URL = null;
class WorkerLoader extends Worker
{
    constructor()
    {
        if (!WORKER_URL)
        {
            WORKER_URL = URL.createObjectURL(new Blob([WORKER_CODE], { type: 'application/javascript' }));
        }
        super(WORKER_URL);
    }
}
WorkerLoader.revokeObjectURL = function revokeObjectURL()
{
    if (WORKER_URL)
    {
        URL.revokeObjectURL(WORKER_URL);
        WORKER_URL = null;
    }
}
`;

        switch (moduleType)
        {
            case 'cjs': {
                result += 'module.exports = WorkerLoader;';
                break;
            }
            case 'esm': {
                result += 'export default WorkerLoader;';
                break;
            }
            default: {
                throw new Error(`Unknown module type: ${moduleType}`);
            }
        }

        return result;
    }
};
