import { uniformParsers } from './uniformParsers';

import type { UboElement, UNIFORM_TYPES_SINGLE, UniformsSyncCallback } from '../types';

export function createUboSyncFunction(
    uboElements: UboElement[],
    parserCode: 'uboWgsl' | 'uboStd40',
    arrayGenerationFunction: (uboElement: UboElement, offsetToAdd: number) => string,
    singleSettersMap: Record<UNIFORM_TYPES_SINGLE, string>,
): UniformsSyncCallback
{
    const funcFragments = [`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `];

    let prev = 0;

    for (let i = 0; i < uboElements.length; i++)
    {
        const uboElement = uboElements[i];

        const name = uboElement.data.name;

        let parsed = false;
        let offset = 0;

        for (let j = 0; j < uniformParsers.length; j++)
        {
            const uniformParser = uniformParsers[j];

            if (uniformParser.test(uboElement.data))
            {
                offset = uboElement.offset / 4;

                funcFragments.push(
                    `name = "${name}";`,
                    `offset += ${offset - prev};`,
                    uniformParsers[j][parserCode] || uniformParsers[j].ubo);
                parsed = true;

                break;
            }
        }

        if (!parsed)
        {
            if (uboElement.data.size > 1)
            {
                offset = uboElement.offset / 4;

                funcFragments.push(arrayGenerationFunction(uboElement, offset - prev));
            }
            else
            {
                const template = singleSettersMap[uboElement.data.type as UNIFORM_TYPES_SINGLE];

                offset = uboElement.offset / 4;

                funcFragments.push(/* wgsl */`
                    v = uv.${name};
                    offset += ${offset - prev};
                    ${template};
                `);
            }
        }

        prev = offset;
    }

    const fragmentSrc = funcFragments.join('\n');

    // eslint-disable-next-line no-new-func
    return new Function(
        'uv',
        'data',
        'dataInt32',
        'offset',
        fragmentSrc,
    ) as UniformsSyncCallback;
}
