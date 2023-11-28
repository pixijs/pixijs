/* eslint-disable quote-props */
import { WGSL_TO_STD40_SIZE } from './createUBOElements';
import { UBO_TO_SINGLE_SETTERS, type UniformsSyncCallback } from './createUniformBufferSyncTypes';
import { uniformBufferParsers } from './uniformBufferParsers';

import type { UBOElement } from './createUBOElements';
import type { UBO_TYPE } from './createUniformBufferSyncTypes';

export function generateUniformBufferSync(
    uboElements: UBOElement[],
): UniformsSyncCallback
{
    const funcFragments = [`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
    `];

    let prev = 0;

    for (let i = 0; i < uboElements.length; i++)
    {
        const uboElement = uboElements[i];

        const name = uboElement.data.name;

        let parsed = false;
        let offset = 0;

        for (let j = 0; j < uniformBufferParsers.length; j++)
        {
            const uniformParser = uniformBufferParsers[j];

            if (uniformParser.test(uboElement.data))
            {
                offset = uboElement.offset / 4;

                funcFragments.push(
                    `name = "${name}";`,
                    `offset += ${offset - prev};`,
                    uniformBufferParsers[j].code);
                parsed = true;

                break;
            }
        }

        if (!parsed)
        {
            if (uboElement.data.size > 1)
            {
                const rowSize = Math.max(WGSL_TO_STD40_SIZE[uboElement.data.type] / 16, 1);
                const elementSize = (uboElement.data.value as Array<number>).length / uboElement.data.size;// size / rowSize;

                const remainder = (4 - (elementSize % 4)) % 4;

                offset = uboElement.offset / 4;

                funcFragments.push(/* wgsl */`
                    v = uv.${name};
                    offset += ${offset - prev};

                    let arrayOffset = offset;

                    t = 0;

                    for(var i=0; i < ${uboElement.data.size * rowSize}; i++)
                    {
                        for(var j = 0; j < ${elementSize}; j++)
                        {
                            data[arrayOffset++] = v[t++];
                        }
                        ${remainder !== 0 ? 'arrayOffset += ${remainder};' : ''}
                    }
                `);
            }
            else
            {
                const template = UBO_TO_SINGLE_SETTERS[uboElement.data.type as UBO_TYPE];

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
        'offset',
        fragmentSrc,
    ) as UniformsSyncCallback;
}
