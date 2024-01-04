import { extensions, ExtensionType } from '../extensions/Extensions';

const environments: { name: string; value: { test: () => boolean; load: () => Promise<boolean> } }[] = [];

extensions.handleByNamedList(ExtensionType.Environment, environments);

/**
 * Automatically detects the environment and loads the appropriate extensions.
 * @param manageImports - whether to add the default imports to the bundle
 * @memberof environment
 */
export async function autoDetectEnvironment(manageImports: boolean): Promise<void>
{
    if (!manageImports) return;

    for (let i = 0; i < environments.length; i++)
    {
        const env = environments[i];

        if (env.value.test())
        {
            await env.value.load();

            return;
        }
    }
}
