import { withEnumerableArrayPrototypeProperty } from '@test-utils';
import { generateUboSyncPolyfillWGSL } from '~/unsafe-eval/ubo/generateUboSyncPolyfill';

import type { UboElement } from '~/rendering/renderers/shared/shader/types';

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

    it('writes Matrix4 elements at the shared-buffer offset', () =>
    {
        const elements = Float32Array.from({ length: 16 }, (_, i) => i + 1);
        const value = { elements };
        const sync = generateUboSyncPolyfillWGSL([{
            data: { name: 'world', type: 'mat4x4<f32>', size: 1, value },
            offset: 16,
            size: 64,
        }]);
        const data = new Float32Array(24);

        sync({ world: value }, data, null, 4);

        expect(data).toEqual(Float32Array.of(0, 0, 0, 0, 0, 0, 0, 0, ...elements));
    });

    it('builds a sync function when Array.prototype has an enumerable property', async () =>
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
        const syncFunction = await withEnumerableArrayPrototypeProperty(() => generateUboSyncPolyfillWGSL(uboElements));
        const data = new Float32Array(8);

        syncFunction({ uValue: 42 }, data, null, 4);

        expect(data[4]).toBe(42);
    });
});
