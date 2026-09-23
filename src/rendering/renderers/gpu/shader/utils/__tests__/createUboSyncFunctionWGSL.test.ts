import { createUboElementsWGSL } from '../createUboElementsWGSL';
import { createUboSyncFunctionWGSL } from '../createUboSyncFunctionWGSL';
import { generateUboSyncPolyfillWGSL } from '~/unsafe-eval/ubo/generateUboSyncPolyfill';

import type { UboElement, UniformData, UniformsSyncCallback } from '~/rendering';

const SENTINEL = 7;
const SPARE = 64;

describe.each([
    ['createUboSyncFunctionWGSL', createUboSyncFunctionWGSL],
    ['generateUboSyncPolyfillWGSL', generateUboSyncPolyfillWGSL],
] as [string, (uboElements: UboElement[]) => UniformsSyncCallback][])('%s (arrays)', (_name, createSync) =>
{
    // Syncs one array uniform into a buffer with spare room after the block, counting how many
    // times the sync reads the uniform's value.
    function syncArray(type: string, count: number, floatsPerElement: number)
    {
        const value = new Float32Array(count * floatsPerElement).map((_, i) => i + 1);
        // An array uniform is its element type with a `size` above 1.
        const uniformData: UniformData[] = [{ name: 'list', type: type as UniformData['type'], value, size: count }];
        const layout = createUboElementsWGSL(uniformData);
        const sync = createSync(layout.uboElements);

        const data = new Float32Array((layout.size / 4) + SPARE).fill(SENTINEL);
        const reads = { count: 0 };
        const counted = new Proxy(value, {
            get(target, key)
            {
                // Count index reads only, not `length` or the typed array's methods.
                if (typeof key === 'string' && Number.isInteger(Number(key))) reads.count++;

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
    ])('should read each float of an array<%s> once and write nothing past the block', (type, floatsPerElement) =>
    {
        const { data, layout, reads, value } = syncArray(type, 8, floatsPerElement);

        expect(reads.count).toBe(value.length);
        expect(Array.from(data.subarray(layout.size / 4))).toEqual(new Array(SPARE).fill(SENTINEL));
    });

    it('should copy an array<vec4<f32>> into consecutive vec4 slots', () =>
    {
        const { data, value } = syncArray('vec4<f32>', 3, 4);

        expect(Array.from(data.subarray(0, 12))).toEqual(Array.from(value));
    });

    it('should start each element of an array<vec3<f32>> on its own 16-byte slot', () =>
    {
        const { data } = syncArray('vec3<f32>', 3, 3);

        expect(Array.from(data.subarray(0, 12))).toEqual([1, 2, 3, SENTINEL, 4, 5, 6, SENTINEL, 7, 8, 9, SENTINEL]);
    });
});
