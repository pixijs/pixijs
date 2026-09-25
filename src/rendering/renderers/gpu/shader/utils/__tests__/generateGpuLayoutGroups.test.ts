import { extractStructAndGroups } from '../extractStructAndGroups';
import { generateGpuLayoutGroups } from '../generateGpuLayoutGroups';

describe('generateGpuLayoutGroups', () =>
{
    it('should derive the texture sample type from the WGSL texel type', () =>
    {
        const [group] = generateGpuLayoutGroups(extractStructAndGroups(`
            @group(0) @binding(0) var uFloat: texture_2d<f32>;
            @group(0) @binding(1) var uUint: texture_2d<u32>;
            @group(0) @binding(2) var uSint: texture_2d<i32>;
            @group(0) @binding(3) var uUintArray: texture_2d_array<u32>;
            @group(0) @binding(4) var uSintCube: texture_cube<i32>;
        `));

        expect(group.map((entry) => entry.texture.sampleType)).toEqual([
            'float',
            'uint',
            'sint',
            'uint',
            'sint',
        ]);
    });
});
