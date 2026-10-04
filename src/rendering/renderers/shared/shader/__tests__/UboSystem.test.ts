import { GlUboSystem } from '../../../gl/GlUboSystem';
import { GpuUboSystem } from '../../../gpu/GpuUboSystem';
import { UniformGroup } from '../UniformGroup';

describe.each([
    ['WebGL', GlUboSystem, [1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0]],
    ['WebGPU', GpuUboSystem, [1, 2, 3, 4]],
] as const)('%s UBO layout caching', (_name, System, expectedArray) =>
{
    it.each([false, true])('should sync different array sizes independently (array first: %s)', (arrayFirst) =>
    {
        const system = new System();
        const scalar = new UniformGroup({
            uValues: { value: 10, type: 'f32' },
        }, { ubo: true });
        const array = new UniformGroup({
            uValues: { value: [1, 2, 3, 4], type: 'f32', size: 4 },
        }, { ubo: true });

        const groups = arrayFirst ? [array, scalar] : [scalar, array];

        for (const group of groups)
        {
            system.syncUniformGroup(group);
        }

        expect(Array.from(scalar.buffer.data)).toEqual([10, 0, 0, 0]);
        expect(Array.from(array.buffer.data)).toEqual(expectedArray);

        scalar.buffer.destroy();
        array.buffer.destroy();
        system.destroy();
    });

    it('should reuse layouts for matching sizes with different values', () =>
    {
        const system = new System();
        const first = new UniformGroup({
            uValues: { value: [1, 2, 3, 4], type: 'f32', size: 4 },
        }, { ubo: true });
        const second = new UniformGroup({
            uValues: { value: [5, 6, 7, 8], type: 'f32', size: 4 },
        }, { ubo: true });

        expect(system.getUniformGroupData(first)).toBe(system.getUniformGroupData(second));

        system.destroy();
    });

    it('should sync arrays of different lengths independently', () =>
    {
        const system = new System();
        const small = new UniformGroup({
            uValues: { value: [1, 2], type: 'f32', size: 2 },
        }, { ubo: true });
        const large = new UniformGroup({
            uValues: { value: [1, 2, 3, 4], type: 'f32', size: 4 },
        }, { ubo: true });

        system.syncUniformGroup(small);
        system.syncUniformGroup(large);

        expect(Array.from(small.buffer.data)).toEqual(
            expectedArray.length === 4 ? [1, 2, 0, 0] : [1, 0, 0, 0, 2, 0, 0, 0]
        );
        expect(Array.from(large.buffer.data)).toEqual(expectedArray);

        small.buffer.destroy();
        large.buffer.destroy();
        system.destroy();
    });

    it('should treat an omitted size as size one when caching layouts', () =>
    {
        const system = new System();
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
