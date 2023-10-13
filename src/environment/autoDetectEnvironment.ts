import { extensions, ExtensionType } from '../extensions/Extensions';
import { browserExt } from './browser/browserExt';
import { webworkerExt } from './webworker/webworkerExt';

const environments: {name: string, value: {test: ((m: boolean) => Promise<boolean>)}}[] = [];

extensions.handleByNamedList(ExtensionType.Environment, environments);
extensions.add(browserExt, webworkerExt);

export type Environment = 'browser' & 'webworker' & string;

export async function autoDetectEnvironment(
    manageImports: boolean,
    preference?: Environment,
): Promise<void>
{
    const preferenceIndex = environments.findIndex((e) => e.name === preference);

    if (preferenceIndex >= 0)
    {
        if (await environments[preferenceIndex].value.test(manageImports))
        {
            return;
        }
    }

    for (let i = 0; i < environments.length; i++)
    {
        const env = environments[i];

        if (await env.value.test(manageImports))
        {
            return;
        }
    }

    // default to browser
    await environments[0].value.test(manageImports);
}
