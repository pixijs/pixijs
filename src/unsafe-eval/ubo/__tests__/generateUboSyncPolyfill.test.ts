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
});
