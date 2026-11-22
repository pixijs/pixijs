import { extractFragmentOutputMaskFromGpuProgram } from '../extractFragmentOutputMaskFromGpuProgram';

describe('extractFragmentOutputMaskFromGpuProgram', () =>
{
    it('reads a single @location return', () =>
    {
        const source = `
            @fragment
            fn mainFragment(@location(0) uv: vec2<f32>, @builtin(position) position: vec4<f32>) -> @location(0) vec4<f32>
            {
                return vec4<f32>(uv, 0.0, 1.0);
            }
        `;

        expect(extractFragmentOutputMaskFromGpuProgram({ source, entryPoint: 'mainFragment' })).toBe(0b1);
    });

    it('reads the locations of a returned struct', () =>
    {
        const source = `
            struct Outputs {
                @location(0) color: vec4<f32>,
                @location(1) velocity: vec2f,
                // @location(3) commented: vec4<f32>,
                @location(3) @blend_src(0) id: u32,
                @builtin(frag_depth) depth: f32,
            };

            @fragment
            fn main(@location(0) uv: vec2<f32>) -> Outputs
            {
                var o: Outputs;
                return o;
            }
        `;

        expect(extractFragmentOutputMaskFromGpuProgram({ source, entryPoint: 'main' })).toBe(0b1011);
    });

    it('picks the requested entry point out of a combined vertex + fragment source', () =>
    {
        const source = `
            struct VSOutput { @builtin(position) position: vec4<f32>, @location(0) uv: vec2<f32> };

            @vertex
            fn mainVertex(@location(0) aPosition: vec2<f32>) -> VSOutput
            {
                var o: VSOutput;
                return o;
            }

            @fragment
            fn mainFragment(input: VSOutput) -> @location(0) vec2<f32>
            {
                return input.uv;
            }
        `;

        expect(extractFragmentOutputMaskFromGpuProgram({ source, entryPoint: 'mainFragment' })).toBe(0b1);
    });

    it('treats an entry point with no return value as writing nothing', () =>
    {
        const source = `
            @fragment
            fn depthOnly(@location(0) uv: vec2<f32>)
            {
            }

            fn helper() -> vec4<f32> { return vec4<f32>(1.0); }
        `;

        expect(extractFragmentOutputMaskFromGpuProgram({ source, entryPoint: 'depthOnly' })).toBe(0);
    });

    it('treats a builtin-only return, such as frag_depth, as writing no color', () =>
    {
        const source = `
            @fragment
            fn fragmentMain(@builtin(position) position: vec4<f32>) -> @builtin(frag_depth) f32
            {
                return 0.5;
            }
        `;

        expect(extractFragmentOutputMaskFromGpuProgram({ source, entryPoint: 'fragmentMain' })).toBe(0);
    });

    it('returns null when the outputs can\'t be read, so every target stays written', () =>
    {
        expect(extractFragmentOutputMaskFromGpuProgram({ source: 'fn other() {}', entryPoint: 'main' })).toBeNull();
        expect(extractFragmentOutputMaskFromGpuProgram({ source: 'fn main() -> Out {}', entryPoint: undefined })).toBeNull();

        // a return type that is neither a @location, a @builtin nor a struct name
        expect(extractFragmentOutputMaskFromGpuProgram({
            source: '@fragment fn main() -> array<vec4<f32>, 2> { }',
            entryPoint: 'main',
        })).toBeNull();
    });
});
