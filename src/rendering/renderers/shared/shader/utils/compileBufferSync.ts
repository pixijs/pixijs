import { uniformParsers } from './uniformParsers';

import type { UboElement, UNIFORM_TYPES_SINGLE, UniformsSyncCallback } from '../types';

/**
 * Compiles a JIT sync function that walks a layout (`UboElement[]`) and writes the
 * matching values from a `uniforms` bag into a Float32Array / Int32Array buffer view
 * at a runtime-supplied offset.
 *
 * The compiled function takes `(uniforms, data, dataInt32, offset)` — note that `offset`
 * is a function argument, *not* a closure capture, so the same compiled function can be
 * reused across many slots in a shared buffer by supplying a different `offset` per call.
 *
 * Per-dialect variation lives in the inputs:
 * - `uboElements` come from the appropriate layout helper (`createUboElementsWGSL`,
 *   `createUboElementsSTD40`) and encode the dialect's alignment / padding rules in
 *   their offsets.
 * - `singleSettersMap` selects per-type writers (`uboSyncFunctionsWGSL` /
 *   `uboSyncFunctionsSTD40`); only `mat2x2<f32>` differs between WGSL and STD40 today.
 * - `arrayGenerationFunction` selects per-dialect array stride emission.
 * @param uboElements - element layout (offsets in bytes) for each uniform in the schema
 * @param singleSettersMap - per-type write code strings keyed by uniform type
 * @param arrayGenerationFunction - emits write code for `size > 1` array uniforms
 * @internal
 */
export function compileBufferSync(
    uboElements: UboElement[],
    singleSettersMap: Record<UNIFORM_TYPES_SINGLE, string>,
    arrayGenerationFunction: (uboElement: UboElement, offsetToAdd: number) => string,
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
                    uniformParsers[j].ubo);
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
