import { createUboElementsSTD40 } from '../../../rendering/renderers/gl/shader/utils/createUboElementsSTD40';
import { createUboElementsWGSL } from '../../../rendering/renderers/gpu/shader/utils/createUboElementsWGSL';
import {
    generateUboSyncPolyfillSTD40,
    generateUboSyncPolyfillWGSL
} from '../generateUboSyncPolyfill';

import type { UniformData } from '~/rendering';

describe('generateUboSyncPolyfillSTD40 (i32/u32 via Int32 view, #12117)', () =>
{
    it('should lay out and round-trip i32 + vec2<u32> in a std140 UBO via the Int32 view', () =>
    {
        // Reproduces #12117: a custom UniformGroup under a strict-CSP
        // `pixi.js/unsafe-eval` build must round-trip integer uniforms through
        // the Int32 view at the caller-supplied byte offset. Earlier the polyfill
        // returned a 3-arg closure that silently dropped the numeric `offset`
        // and coerced the Int32Array to a string key, so writes landed on
        // expando properties and the underlying buffer stayed all-zero.
        const uniformData: UniformData[] = [
            { name: 'idx', type: 'i32', value: -7, size: 1 },
            { name: 'pair', type: 'vec2<u32>', value: new Uint32Array([0x80000000, 0xFFFFFFFF]), size: 1 },
        ];

        const layout = createUboElementsSTD40(uniformData);

        // std140: i32@byte0, vec2<u32> aligns to 8 → byte8. Trailing pad to 16.
        expect(layout).toMatchObject({
            uboElements: [
                { offset: 0, size: 4 },
                { offset: 8, size: 8 },
            ],
            size: 16,
        });

        const sync = generateUboSyncPolyfillSTD40(layout.uboElements);

        const data = new Float32Array(layout.size / 4);
        const dataInt32 = new Int32Array(data.buffer);
        const u32View = new Uint32Array(data.buffer);

        const uniforms = {
            idx: uniformData[0].value,
            pair: uniformData[1].value,
        };

        sync(uniforms, data, dataInt32, 0);

        expect(dataInt32[0]).toBe(-7);
        expect(u32View[0]).toBe(0xFFFFFFF9);
        expect(u32View[2]).toBe(0x80000000);
        expect(u32View[3]).toBe(0xFFFFFFFF);
    });

    it('should honor a non-zero caller-supplied byte offset (write at offset=4, not 0)', () =>
    {
        // The earlier 3-arg polyfill dropped the 4th argument entirely; writes
        // always landed at byte 0. With the 4-arg signature, calling
        // `sync(..., offset=1)` (1 float = 4 bytes) must place the i32 at
        // byte 4 and the vec2<u32> at byte 12.
        const uniformData: UniformData[] = [
            { name: 'idx', type: 'i32', value: -7, size: 1 },
            { name: 'pair', type: 'vec2<u32>', value: new Uint32Array([0x80000000, 0xFFFFFFFF]), size: 1 },
        ];

        const layout = createUboElementsSTD40(uniformData);
        const sync = generateUboSyncPolyfillSTD40(layout.uboElements);

        // 4 extra floats of headroom so offset=1 (1 float) actually shifts.
        const data = new Float32Array((layout.size / 4) + 4);
        const dataInt32 = new Int32Array(data.buffer);
        const u32View = new Uint32Array(data.buffer);

        sync(
            { idx: -7, pair: new Uint32Array([0x80000000, 0xFFFFFFFF]) },
            data,
            dataInt32,
            1
        );

        // bytes 0..3 and 8..11 (float indices 0, 2) must remain untouched
        expect(u32View[0]).toBe(0);
        expect(u32View[2]).toBe(0);
        // bytes 4..7: i32 -7
        expect(u32View[1]).toBe(0xFFFFFFF9);
        expect(dataInt32[1]).toBe(-7);
        // bytes 12..15: vec2<u32>[0] = 0x80000000
        expect(u32View[3]).toBe(0x80000000);
        // bytes 16..19: vec2<u32>[1] = 0xFFFFFFFF
        expect(u32View[4]).toBe(0xFFFFFFFF);
    });

    it('should write a single f32 at the caller-supplied offset (Float32 view path unchanged)', () =>
    {
        // Sanity check that float-typed uniforms (which write through the
        // Float32Array view) are also positioned correctly with the new
        // 4-arg signature.
        const uniformData: UniformData[] = [
            { name: 'scale', type: 'f32', value: 3.5, size: 1 },
        ];

        const layout = createUboElementsSTD40(uniformData);
        const sync = generateUboSyncPolyfillSTD40(layout.uboElements);

        const data = new Float32Array(8);
        const dataInt32 = new Int32Array(data.buffer);

        sync({ scale: 3.5 }, data, dataInt32, 2);

        expect(data[2]).toBe(3.5);
        expect(data[0]).toBe(0);
        expect(data[1]).toBe(0);
        expect(data[3]).toBe(0);
    });
});

describe('generateUboSyncPolyfillWGSL (i32/u32 via Int32 view, #12117)', () =>
{
    it('should write i32 + vec2<u32> through the Int32 view at offset 0', () =>
    {
        const uniformData: UniformData[] = [
            { name: 'idx', type: 'i32', value: -7, size: 1 },
            { name: 'pair', type: 'vec2<u32>', value: new Uint32Array([0x80000000, 0xFFFFFFFF]), size: 1 },
        ];

        const layout = createUboElementsWGSL(uniformData);
        const sync = generateUboSyncPolyfillWGSL(layout.uboElements);

        const data = new Float32Array(layout.size / 4);
        const dataInt32 = new Int32Array(data.buffer);
        const u32View = new Uint32Array(data.buffer);

        sync(
            { idx: -7, pair: new Uint32Array([0x80000000, 0xFFFFFFFF]) },
            data,
            dataInt32,
            0
        );

        expect(dataInt32[0]).toBe(-7);
        expect(u32View[0]).toBe(0xFFFFFFF9);
        expect(u32View[2]).toBe(0x80000000);
        expect(u32View[3]).toBe(0xFFFFFFFF);
    });
});
