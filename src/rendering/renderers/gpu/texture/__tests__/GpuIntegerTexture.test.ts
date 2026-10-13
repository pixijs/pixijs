import { Geometry } from '../../../shared/geometry/Geometry';
import { RenderTarget } from '../../../shared/renderTarget/RenderTarget';
import { Shader } from '../../../shared/shader/Shader';
import { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';
import { Mesh } from '~/scene';

// 1 is a denormal when its bits are read as a float, and 0xFFFFFFFF is a NaN.
// A float texture may not return either bit-exact
const texels = new Uint32Array([
    1, 0xFFFFFFFF, 7, 0,
    0x80000000, 2, 0x7F800001, 42,
]);

const gpuShader = {
    vertex: {
        entryPoint: 'main',
        source: /* wgsl */`
            struct VertexOutput { @builtin(position) position: vec4<f32> };

            @vertex
            fn main(@location(0) aPosition: vec2<f32>) -> VertexOutput
            {
                var out: VertexOutput;
                out.position = vec4<f32>(aPosition, 0.0, 1.0);
                return out;
            }
        `,
    },
    fragment: {
        entryPoint: 'main',
        source: /* wgsl */`
            @group(0) @binding(0) var uData: texture_2d<u32>;

            @fragment
            fn main() -> @location(0) vec4<f32>
            {
                let a = textureLoad(uData, vec2<i32>(0, 0), 0);
                let b = textureLoad(uData, vec2<i32>(1, 0), 0);
                let ok = all(a == vec4<u32>(1u, 0xFFFFFFFFu, 7u, 0u))
                    && all(b == vec4<u32>(0x80000000u, 2u, 0x7F800001u, 42u));

                return select(vec4<f32>(1.0, 0.0, 0.0, 1.0), vec4<f32>(0.0, 1.0, 0.0, 1.0), ok);
            }
        `,
    },
};

describeLocalOnly('GpuTextureSystem integer formats', () =>
{
    it('should upload an rgba32uint texture and read the exact bits through a texture_2d<u32>', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 4, height: 4 });
        const device = renderer.gpu.device;
        const integerSource = new BufferImageSource({ resource: texels, width: 2, height: 1, scaleMode: 'nearest' });
        const colorTexture = new Texture({ source: new TextureSource({ width: 4, height: 4, resolution: 1 }) });
        const renderTarget = new RenderTarget({ colorTextures: [colorTexture] });

        const quad = new Mesh({
            geometry: new Geometry({ attributes: { aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1] } }),
            shader: Shader.from({ gpu: gpuShader, resources: { uData: integerSource } }),
        });

        device.pushErrorScope('validation');
        renderer.render({ target: renderTarget, container: quad, clear: true, clearColor: [0, 0, 0, 1] });

        expect(await device.popErrorScope()).toBeNull();

        const { pixels } = renderer.extract.pixels(colorTexture);

        expect(Array.from(pixels.slice(0, 4))).toEqual([0, 255, 0, 255]);

        renderer.destroy();
    });
});
