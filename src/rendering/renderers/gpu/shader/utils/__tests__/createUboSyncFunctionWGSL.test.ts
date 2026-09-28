import { createUboElementsWGSL } from '../createUboElementsWGSL';
import { createUboSyncFunctionWGSL } from '../createUboSyncFunctionWGSL';
import { generateUboSyncPolyfillWGSL } from '~/unsafe-eval/ubo/generateUboSyncPolyfill';

import type { UNIFORM_TYPES_SINGLE, UniformData } from '~/rendering';

const SENTINEL = 7;
const SPARE = 64;

describe.each([
    ['createUboSyncFunctionWGSL', createUboSyncFunctionWGSL],
    ['generateUboSyncPolyfillWGSL', generateUboSyncPolyfillWGSL],
])('%s (arrays)', (_name, createSync) =>
{
    function syncArray(type: UNIFORM_TYPES_SINGLE, count: number, floatsPerElement: number)
    {
        const value = new Float32Array(count * floatsPerElement).map((_, i) => i + 1);
        const uniformData: UniformData[] = [{ name: 'list', type, value, size: count }];
        const layout = createUboElementsWGSL(uniformData);
        const sync = createSync(layout.uboElements);

        const data = new Float32Array((layout.size / 4) + SPARE).fill(SENTINEL);
        let reads = 0;
        const counted = new Proxy(value, {
            get(target, key)
            {
                const isIndex = typeof key === 'string' && Number.isInteger(Number(key));

                if (isIndex) reads++;

                return Reflect.get(target, key);
            },
        });

        sync({ list: counted }, data, new Int32Array(data.buffer), 0);

        return { data, layout, reads, value };
    }

    it.each([
        ['vec4<f32>', 4],
        ['vec3<f32>', 3],
        ['vec2<f32>', 2],
        ['f32', 1],
        ['mat4x4<f32>', 16],
    ] as const)('should read each float of an array<%s> once and write nothing past the block', (type, floatsPerElement) =>
    {
        const { data, layout, reads, value } = syncArray(type, 8, floatsPerElement);

        expect(reads).toBe(value.length);
        expect(Array.from(data.subarray(layout.size / 4))).toEqual(new Array(SPARE).fill(SENTINEL));
    });

    it('should copy an array<vec4<f32>> into consecutive vec4 slots', () =>
    {
        const { data, value } = syncArray('vec4<f32>', 3, 4);

        expect(Array.from(data.subarray(0, 12))).toEqual(Array.from(value));
    });

    it('should copy an array<mat4x4<f32>> into consecutive 64-byte slots', () =>
    {
        const { data, value } = syncArray('mat4x4<f32>', 2, 16);

        expect(Array.from(data.subarray(0, 32))).toEqual(Array.from(value));
    });

    it('should start each element of an array<vec3<f32>> on its own 16-byte slot', () =>
    {
        const { data } = syncArray('vec3<f32>', 3, 3);

        expect(Array.from(data.subarray(0, 12))).toEqual([1, 2, 3, SENTINEL, 4, 5, 6, SENTINEL, 7, 8, 9, SENTINEL]);
    });
});
