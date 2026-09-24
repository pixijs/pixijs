import { Geometry } from '../../../shared/geometry/Geometry';
import { RenderTarget } from '../../../shared/renderTarget/RenderTarget';
import { Shader } from '../../../shared/shader/Shader';
import { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { getWebGLRenderer } from '@test-utils';
import { Graphics, Mesh, Sprite } from '~/scene';

import type { WebGLRenderer } from '../../WebGLRenderer';
import type { Container } from '~/scene';

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

    const batchedViews: Record<string, () => Container> = {
        // drawn by GlBatchAdaptor
        sprite: () => new Sprite({ texture: Texture.WHITE, width: 4, height: 4 }),
        // drawn by GlGraphicsAdaptor
        graphics: () =>
        {
            const graphics = new Graphics().rect(0, 0, 4, 4).fill(0xffffff);

            graphics.context.batchMode = 'no-batch';

            return graphics;
        },
    };

    it.each(Object.keys(batchedViews))(
        'should not fail a %s batch when an integer texture is left on a unit the batch does not use',
        async (name) =>
        {
            const renderer = (await getWebGLRenderer({ width: 4, height: 4 })) as WebGLRenderer;
            const gl = renderer.gl;
            const colorTexture = new Texture({ source: new TextureSource({ width: 4, height: 4, resolution: 1 }) });
            const renderTarget = new RenderTarget({ colorTextures: [colorTexture] });
            const integerTexture = new Texture({
                source: new BufferImageSource({ resource: texels, width: 2, height: 1, scaleMode: 'nearest' }),
            });
            const view = batchedViews[name]();

            const draw = () =>
            {
                gl.getError();
                renderer.render({ target: renderTarget, container: view, clear: true, clearColor: [0, 0, 0, 1] });

                const error = gl.getError();
                const { pixels } = renderer.extract.pixels(colorTexture);

                return { error, pixel: Array.from(pixels.slice(0, 4)) };
            };

            const drawn = { error: gl.NO_ERROR, pixel: [255, 255, 255, 255] };

            // left on unit 1 by an earlier draw's bind
            renderer.texture.bind(integerTexture, 1);

            expect(draw()).toEqual(drawn);

            // left on unit 3 by an upload, which binds to the active unit without going through bind()
            renderer.texture.bind(Texture.WHITE, 3);
            integerTexture.source.update();

            expect(draw()).toEqual(drawn);

            renderer.destroy();
        },
    );

    it('should track which units hold integer textures', async () =>
    {
        const renderer = (await getWebGLRenderer({ width: 4, height: 4 })) as WebGLRenderer;
        const textureSystem = renderer.texture;
        const integerTexture = new Texture({
            source: new BufferImageSource({ resource: texels, width: 2, height: 1, scaleMode: 'nearest' }),
        });

        expect(textureSystem['_integerUnits']).toBe(0);

        // set by bind, cleared by binding a float texture over it
        textureSystem.bind(integerTexture, 3);
        expect(textureSystem['_integerUnits']).toBe(1 << 3);
        textureSystem.bind(Texture.WHITE, 3);
        expect(textureSystem['_integerUnits']).toBe(0);

        // set by an upload onto the active unit
        textureSystem.bind(Texture.WHITE, 5);
        integerTexture.source.update();
        expect(textureSystem['_integerUnits']).toBe(1 << 5);

        // cleared by unbind
        textureSystem.unbind(integerTexture);
        expect(textureSystem['_integerUnits']).toBe(0);

        // unbindIntegerTextures only clears units from its location up
        textureSystem.bind(integerTexture, 1);
        textureSystem.bind(integerTexture, 6);
        textureSystem.unbindIntegerTextures(2);
        expect(textureSystem['_integerUnits']).toBe(1 << 1);
        expect(textureSystem['_boundTextures'][6]).toBe(Texture.EMPTY.source);

        // cleared by resetState
        textureSystem.resetState();
        expect(textureSystem['_integerUnits']).toBe(0);

        // units outside 0-31 don't alias onto the mask
        textureSystem['_setBoundTexture'](32, integerTexture.source);
        textureSystem['_setBoundTexture'](-1, integerTexture.source);
        expect(textureSystem['_integerUnits']).toBe(0);

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
