import { createUboElementsSTD40 } from '../createUboElementsSTD40';
import { createUboSyncFunctionSTD40 } from '../createUboSyncSTD40';

import type { UniformData } from '~/rendering';

describe('createUboSyncFunctionSTD40 (u32)', () =>
{
    it('should lay out and round-trip u32 + vec2<u32> in a std140 UBO via the Int32 view', () =>
    {
        const uniformData: UniformData[] = [
            { name: 'idx', type: 'u32', value: 0xDEADBEEF, size: 1 },
            { name: 'pair', type: 'vec2<u32>', value: new Uint32Array([0x80000000, 0xFFFFFFFF]), size: 1 },
        ];

        const layout = createUboElementsSTD40(uniformData);

        // std140: u32@byte0, vec2<u32> aligns to 8 → byte8. Trailing pad to 16.
        expect(layout).toMatchObject({
            uboElements: [
                { offset: 0, size: 4 },
                { offset: 8, size: 8 },
            ],
            size: 16,
        });

        const sync = createUboSyncFunctionSTD40(layout.uboElements);

        const data = new Float32Array(layout.size / 4);
        const dataInt32 = new Int32Array(data.buffer);
        const u32View = new Uint32Array(data.buffer);

        const uniforms = {
            idx: uniformData[0].value,
            pair: uniformData[1].value,
        };

        sync(uniforms, data, dataInt32, 0);

        expect(u32View[0]).toBe(0xDEADBEEF);
        expect(u32View[2]).toBe(0x80000000);
        expect(u32View[3]).toBe(0xFFFFFFFF);
    });
});
