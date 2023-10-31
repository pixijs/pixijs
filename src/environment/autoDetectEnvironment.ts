import { extensions, ExtensionType } from '../extensions/Extensions';
import { browserExt } from './browser/browserExt';
import { webworkerExt } from './webworker/webworkerExt';

const environments: { name: string; value: { test: () => boolean; load: () => Promise<boolean> } }[] = [];

extensions.handleByNamedList(ExtensionType.Environment, environments);
extensions.add(browserExt, webworkerExt);

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
