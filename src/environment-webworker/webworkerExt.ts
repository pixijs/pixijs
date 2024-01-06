import { ExtensionType } from '../extensions/Extensions';

/**
 * Extension for the webworker environment.
 * @memberof environment
 */
export const webworkerExt = {
    extension: {
        type: ExtensionType.Environment,
        name: 'webworker',
        priority: 0,
    },
    test: () => typeof self !== 'undefined' && self.WorkerGlobalScope !== undefined,
    load: async () =>
    {
        await import('./webworkerAll');
    },
};
