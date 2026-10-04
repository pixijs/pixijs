import { GlUboSystem } from '../../../gl/GlUboSystem';
import { createUboElementsSTD40 } from '../../../gl/shader/utils/createUboElementsSTD40';
import { GpuUboSystem } from '../../../gpu/GpuUboSystem';
import { createUboElementsWGSL } from '../../../gpu/shader/utils/createUboElementsWGSL';
import { UboSystem } from '../UboSystem';
import { UniformGroup } from '../UniformGroup';
import { generateUboSyncPolyfillSTD40, generateUboSyncPolyfillWGSL } from '~/unsafe-eval/ubo/generateUboSyncPolyfill';

describe.each([
    ['WebGL', () => new GlUboSystem()],
    ['WebGPU', () => new GpuUboSystem()],
    ['WebGL polyfill', () => new UboSystem({
        createUboElements: createUboElementsSTD40,
        generateUboSync: generateUboSyncPolyfillSTD40,
    })],
    ['WebGPU polyfill', () => new UboSystem({
        createUboElements: createUboElementsWGSL,
        generateUboSync: generateUboSyncPolyfillWGSL,
    })],
] as const)('%s UBO layout caching', (_name, createSystem) =>
{
    it.each([false, true])('should sync different array sizes independently (array first: %s)', (arrayFirst) =>
    {
        const system = createSystem();
        const scalar = new UniformGroup({
            uValues: { value: [10, 20, 30, 40], type: 'vec4<f32>' },
        }, { ubo: true });
        const array = new UniformGroup({
            uValues: { value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], type: 'vec4<f32>', size: 4 },
        }, { ubo: true });

        const groups = arrayFirst ? [array, scalar] : [scalar, array];

        for (const group of groups)
        {
            system.syncUniformGroup(group);
        }

        expect(Array.from(scalar.buffer.data)).toEqual([10, 20, 30, 40]);
        expect(Array.from(array.buffer.data)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

        scalar.buffer.destroy();
        array.buffer.destroy();
        system.destroy();
    });

    it('should reuse layouts for matching sizes with different values', () =>
    {
        const system = createSystem();
        const first = new UniformGroup({
            uValues: { value: [1, 2, 3, 4, 5, 6, 7, 8], type: 'vec4<f32>', size: 2 },
        }, { ubo: true });
        const second = new UniformGroup({
            uValues: { value: [8, 7, 6, 5, 4, 3, 2, 1], type: 'vec4<f32>', size: 2 },
        }, { ubo: true });

        expect(system.getUniformGroupData(first)).toBe(system.getUniformGroupData(second));

        system.destroy();
    });

    it('should sync arrays of different lengths independently', () =>
    {
        const system = createSystem();
        const small = new UniformGroup({
            uValues: { value: [1, 2, 3, 4, 5, 6, 7, 8], type: 'vec4<f32>', size: 2 },
        }, { ubo: true });
        const large = new UniformGroup({
            uValues: { value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], type: 'vec4<f32>', size: 4 },
        }, { ubo: true });

        system.syncUniformGroup(small);
        system.syncUniformGroup(large);

        expect(Array.from(small.buffer.data)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(Array.from(large.buffer.data)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

        small.buffer.destroy();
        large.buffer.destroy();
        system.destroy();
    });

    it('should treat an omitted size as size one when caching layouts', () =>
    {
        const system = createSystem();
        const implicit = new UniformGroup({
            uValues: { value: 10, type: 'f32' },
        }, { ubo: true });
        const explicit = new UniformGroup({
            uValues: { value: 20, type: 'f32', size: 1 },
        }, { ubo: true });

        expect(system.getUniformGroupData(implicit)).toBe(system.getUniformGroupData(explicit));

        system.destroy();
    });
});
