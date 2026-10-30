import {
    createUboElementsSTD40,
    WGSL_TO_STD40_SIZE
} from '~/rendering/renderers/gl/shader/utils/createUboElementsSTD40';
import { createUboSyncFunctionSTD40 } from '~/rendering/renderers/gl/shader/utils/createUboSyncSTD40';
import { createUboElementsWGSL } from '~/rendering/renderers/gpu/shader/utils/createUboElementsWGSL';
import { createUboSyncFunctionWGSL } from '~/rendering/renderers/gpu/shader/utils/createUboSyncFunctionWGSL';
import { uboSyncFunctionsWGSL } from '~/rendering/renderers/shared/shader/utils/uboSyncFunctions';
import { generateUboSyncPolyfillSTD40, generateUboSyncPolyfillWGSL } from '~/unsafe-eval/ubo/generateUboSyncPolyfill';

import type {
    UboElement,
    UboLayout,
    UNIFORM_TYPES_SINGLE,
    UniformData,
    UniformsSyncCallback,
} from '~/rendering/renderers/shared/shader/types';

describe('generateUboSyncPolyfillWGSL', () =>
{
    it('uses the fourth argument as the shared-buffer offset', () =>
    {
        const uboElements: UboElement[] = [{
            data: {
                name: 'uValue',
                type: 'f32',
                value: 0,
                size: 1,
            },
            offset: 0,
            size: 4,
        }];
        const syncFunction = generateUboSyncPolyfillWGSL(uboElements);
        const data = new Float32Array(8);

        syncFunction({ uValue: 42 }, data, null, 4);

        expect(data[0]).toBe(0);
        expect(data[4]).toBe(42);
    });

    it('writes integer uniforms through the Int32 view', () =>
    {
        const layout = createUboElementsWGSL([
            { name: 'uCount', type: 'i32', value: 0, size: 1 },
            { name: 'uFlags', type: 'u32', value: 0, size: 1 },
            { name: 'uCell', type: 'vec2<i32>', value: [0, 0], size: 1 },
        ]);
        const syncFunction = generateUboSyncPolyfillWGSL(layout.uboElements);
        const data = new Float32Array(layout.size / 4);
        const dataInt32 = new Int32Array(data.buffer);

        syncFunction({ uCount: 7, uFlags: 3, uCell: [-2, 5] }, data, dataInt32, 0);

        expect(Array.from(dataInt32.subarray(0, 4))).toEqual([7, 3, -2, 5]);
    });
});

const SENTINEL = -1;

function componentCount(type: string): number
{
    // 'mat3x2<f32>' has 3 * 2 components, 'vec3<i32>' has 3, scalars have 1
    if (type.startsWith('mat')) return Number(type[3]) * Number(type[5]);
    if (type.startsWith('vec')) return Number(type[3]);

    return 1;
}

function createUniforms(types: string[], size = 1): UniformData[]
{
    return types.map((type, index) =>
    {
        const count = componentCount(type) * size;
        const values = Array.from({ length: count }, (_, i) => (index * 100) + i + 1);

        return {
            name: `u${index}`,
            type: type as UNIFORM_TYPES_SINGLE,
            value: count === 1 ? values[0] : values,
            size,
        };
    });
}

function runSync(
    layout: UboLayout,
    uniformData: UniformData[],
    createSync: (uboElements: UboElement[]) => UniformsSyncCallback,
)
{
    const data = new Float32Array(layout.size / 4);
    const dataInt32 = new Int32Array(data.buffer).fill(SENTINEL);
    const uniforms: Record<string, unknown> = {};

    for (const uniform of uniformData)
    {
        uniforms[uniform.name] = uniform.value;
    }

    createSync(layout.uboElements)(uniforms, data, dataInt32, 0);

    return Array.from(dataInt32);
}

describe.each([
    [
        'WGSL',
        Object.keys(uboSyncFunctionsWGSL),
        createUboElementsWGSL,
        createUboSyncFunctionWGSL,
        generateUboSyncPolyfillWGSL,
    ],
    [
        'STD40',
        Object.keys(WGSL_TO_STD40_SIZE),
        createUboElementsSTD40,
        createUboSyncFunctionSTD40,
        generateUboSyncPolyfillSTD40,
    ],
] as const)('unsafe-eval UBO polyfill (%s)', (_name, types, createElements, createEvalSync, createPolyfillSync) =>
{
    it('writes the same bytes as the eval build for every single-value uniform type', () =>
    {
        const uniformData = createUniforms(types);
        const layout = createElements(uniformData);

        expect(runSync(layout, uniformData, createPolyfillSync)).toEqual(runSync(layout, uniformData, createEvalSync));
    });

    it.each(['i32', 'vec4<i32>'])('writes the same bytes as the eval build for an array<%s>', (type) =>
    {
        const uniformData = createUniforms([type], 3);
        const layout = createElements(uniformData);

        expect(runSync(layout, uniformData, createPolyfillSync)).toEqual(runSync(layout, uniformData, createEvalSync));
    });
});
