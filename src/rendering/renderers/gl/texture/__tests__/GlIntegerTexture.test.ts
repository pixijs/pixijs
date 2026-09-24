import { Geometry } from '../../../shared/geometry/Geometry';
import { RenderTarget } from '../../../shared/renderTarget/RenderTarget';
import { Shader } from '../../../shared/shader/Shader';
import { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { getWebGLRenderer } from '@test-utils';
import { Mesh, Sprite } from '~/scene';

import type { WebGLRenderer } from '../../WebGLRenderer';

// 1 is a denormal when its bits are read as a float, and 0xFFFFFFFF is a NaN:
// both are values a float texture may not return bit-exact
const texels = new Uint32Array([
    1, 0xFFFFFFFF, 7, 0,
    0x80000000, 2, 0x7F800001, 42,
]);

const glShader = {
    vertex: `#version 300 es
        precision highp float;
        in vec2 aPosition;
        void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
    `,
    fragment: `#version 300 es
        precision highp float;
        precision highp usampler2D;
        uniform usampler2D uData;
        out vec4 fragColor;
        void main()
        {
            bool match = texelFetch(uData, ivec2(0, 0), 0) == uvec4(1u, 0xFFFFFFFFu, 7u, 0u)
                && texelFetch(uData, ivec2(1, 0), 0) == uvec4(0x80000000u, 2u, 0x7F800001u, 42u);

            fragColor = match ? vec4(0.0, 1.0, 0.0, 1.0) : vec4(1.0, 0.0, 0.0, 1.0);
        }
    `,
};

describe('GlTextureSystem integer formats', () =>
{
    it('should upload an rgba32uint texture and read the exact bits through a usampler2D', async () =>
    {
        const renderer = (await getWebGLRenderer({ width: 4, height: 4 })) as WebGLRenderer;
        const gl = renderer.gl;

        const data = new BufferImageSource({
            resource: texels,
            width: 2,
            height: 1,
            format: 'rgba32uint',
            scaleMode: 'nearest',
        });

        const colorTexture = new Texture({
            source: new TextureSource({
                width: 4, height: 4, resolution: 1, mipLevelCount: 1, autoGenerateMipmaps: false,
            }),
        });
        const renderTarget = new RenderTarget({ colorTextures: [colorTexture] });

        const quad = new Mesh({
            geometry: new Geometry({ attributes: { aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1] } }),
            shader: Shader.from({ gl: glShader, resources: { uData: data } }),
        });

        gl.getError();

        renderer.render({ target: renderTarget, container: quad, clear: true, clearColor: [0, 0, 0, 1] });

        expect(gl.getError()).toBe(gl.NO_ERROR);

        const { pixels } = renderer.extract.pixels(colorTexture);

        expect(Array.from(pixels.slice(0, 4))).toEqual([0, 255, 0, 255]);

        renderer.destroy();
    });

    it('should not fail a sprite batch when an integer texture is left on a unit the batch does not use', async () =>
    {
        const renderer = (await getWebGLRenderer({ width: 4, height: 4 })) as WebGLRenderer;
        const gl = renderer.gl;
        const colorTexture = new Texture({ source: new TextureSource({ width: 4, height: 4, resolution: 1 }) });
        const renderTarget = new RenderTarget({ colorTextures: [colorTexture] });
        const integerTexture = new Texture({
            source: new BufferImageSource({ resource: texels, width: 2, height: 1, scaleMode: 'nearest' }),
        });
        const sprite = new Sprite({ texture: Texture.WHITE, width: 4, height: 4 });

        const drawSprite = () =>
        {
            gl.getError();
            renderer.render({ target: renderTarget, container: sprite, clear: true, clearColor: [0, 0, 0, 1] });

            const error = gl.getError();
            const { pixels } = renderer.extract.pixels(colorTexture);

            return { error, pixel: Array.from(pixels.slice(0, 4)) };
        };

        const drawn = { error: gl.NO_ERROR, pixel: [255, 255, 255, 255] };

        // left on unit 1 by an earlier draw's bind
        renderer.texture.bind(integerTexture, 1);

        expect(drawSprite()).toEqual(drawn);

        // left on unit 3 by an upload, which binds to the active unit without going through bind()
        renderer.texture.bind(Texture.WHITE, 3);
        integerTexture.source.update();

        expect(drawSprite()).toEqual(drawn);

        renderer.destroy();
    });

    it('should default integer buffer sources to no premultiply, unless alphaMode is given', () =>
    {
        expect(new BufferImageSource({ resource: new Uint32Array(4), width: 1, height: 1 }).alphaMode)
            .toBe('no-premultiply-alpha');
        expect(new BufferImageSource({ resource: new Uint8Array(4), width: 1, height: 1, format: 'rgba8sint' }).alphaMode)
            .toBe('no-premultiply-alpha');
        expect(new BufferImageSource({ resource: new Float32Array(4), width: 1, height: 1 }).alphaMode)
            .toBe('premultiply-alpha-on-upload');
        expect(new BufferImageSource({
            resource: new Uint32Array(4), width: 1, height: 1, alphaMode: 'premultiplied-alpha',
        }).alphaMode).toBe('premultiplied-alpha');
    });
});
