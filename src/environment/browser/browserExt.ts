import { ExtensionType } from '../../extensions/Extensions';

export const browserExt = {
    extension: {
        type: ExtensionType.Environment,
        name: 'browser',
        priority: -1,
    },
    test: async (manageImports: boolean) =>
    {
        if (manageImports)
        {
            await import('./browserAll');
        }

        return true;
    },
};
