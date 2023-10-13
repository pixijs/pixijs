import { ExtensionType } from '../../extensions/Extensions';

export const webworkerExt = {
    extension: {
        type: ExtensionType.Environment,
        name: 'webworker',
        priority: 0,
    },
    test: async (manageImports: boolean) =>
    {
        if (typeof self === 'undefined' || self.WorkerGlobalScope === undefined)
        {
            return false;
        }

        if (manageImports)
        {
            await import('./webworkerAll');
        }

        return true;
    },
};
