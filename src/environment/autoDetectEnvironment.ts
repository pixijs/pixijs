import { extensions, ExtensionType } from '../extensions/Extensions';

const environments: { name: string; value: { test: () => boolean; load: () => Promise<boolean> } }[] = [];

extensions.handleByNamedList(ExtensionType.Environment, environments);

/**
 * Automatically detects the environment and loads the appropriate extensions.
 * @param skip - whether to skip loading the default extensions
 */
export async function loadEnvironmentExtensions(skip: boolean): Promise<void>
{
    if (skip) return;

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

/**
 * @param add - whether to add the default imports to the bundle
 * @deprecated since 8.1.6. Use `loadEnvironmentExtensions` instead
 */
export async function autoDetectEnvironment(add: boolean): Promise<void>
{
    return loadEnvironmentExtensions(!add);
}
