import { extractStructAndGroups } from '../extractStructAndGroups';

describe('extractStructAndGroups', () =>
{
    it('should extract groups and structs from WGSL shader', () =>
    {
        const wgslShader = `
            struct Particle {
                position : vec2f,
                velocity : vec2f,
            }

            @group(0) @binding(0) var<storage, read_write> particles : array<Particle>;
            @group(0) @binding(1) var<uniform> deltaTime : f32;
        `;

        const result = extractStructAndGroups(wgslShader);

        expect(result.groups).toHaveLength(2);
        expect(result.groups[0]).toEqual({
            group: 0,
            binding: 0,
            name: 'particles',
            isUniform: false,
            type: 'array<Particle>',
        });
        expect(result.groups[1]).toEqual({
            group: 0,
            binding: 1,
            name: 'deltaTime',
            isUniform: true,
            type: 'f32',
        });

        expect(result.structs).toHaveLength(1);
        expect(result.structs[0].name).toBe('Particle');
        expect(result.structs[0].members).toEqual({
            position: 'vec2f',
            velocity: 'vec2f',
        });
    });

    it('should handle generic types with angle brackets in resource bindings', () =>
    {
        // Test case for issue #11821: type pattern should capture full generic types like array<Particle>
        const wgslShader = `
            struct MyStruct {
                value : f32,
            }

            @group(0) @binding(0) var<storage> data : array<MyStruct>;
        `;

        const result = extractStructAndGroups(wgslShader);

        // The type should be the full 'array<MyStruct>', not truncated to 'array'
        expect(result.groups[0].type).toBe('array<MyStruct>');

        // The struct should be included because the type matches
        expect(result.structs).toHaveLength(1);
        expect(result.structs[0].name).toBe('MyStruct');
    });

    it('should handle nested generic types', () =>
    {
        const wgslShader = `
            struct Data {
                x : f32,
            }

            @group(0) @binding(0) var<storage> complexType : array<vec4<f32>>;
            @group(1) @binding(0) var<storage> structArray : array<Data>;
        `;

        const result = extractStructAndGroups(wgslShader);

        expect(result.groups[0].type).toBe('array<vec4<f32>>');
        expect(result.groups[1].type).toBe('array<Data>');
    });

    it('should return empty arrays when no groups or structs are present', () =>
    {
        const wgslShader = `
            @vertex fn main() -> @builtin(position) vec4f {
                return vec4f(0.0);
            }
        `;

        const result = extractStructAndGroups(wgslShader);

        expect(result.groups).toEqual([]);
        expect(result.structs).toEqual([]);
    });
});
