import { Geometry } from '../../../shared/geometry/Geometry';
import { RenderTarget } from '../../../shared/renderTarget/RenderTarget';
import { Shader } from '../../../shared/shader/Shader';
import { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { nonCompressedFormats } from '../../../shared/texture/utils/getSupportedTextureFormats';
import { isIntegerFormat } from '../../../shared/texture/utils/isIntegerFormat';
import { getWebGLRenderer } from '@test-utils';
import { Graphics, Mesh, Sprite } from '~/scene';

import type { TypedArray } from '../../../shared/buffer/Buffer';
import type { TEXTURE_FORMATS } from '../../../shared/texture/const';
import type { WebGLRenderer } from '../../WebGLRenderer';
import type { Container } from '~/scene';

// 1 is a denormal when its bits are read as a float, and 0xFFFFFFFF is a NaN:
// both are values a float texture may not return bit-exact
const texels = new Uint32Array([
    1, 0xFFFFFFFF, 7, 0,
    0x80000000, 2, 0x7F800001, 42,
]);

/**
 * A renderer with an integer texture ready to bind, and a `draw` that renders a view to a 4x4 target
 * and returns the GL error and the first pixel.
 */
async function setup()
{
    const renderer = (await getWebGLRenderer({ width: 4, height: 4 })) as WebGLRenderer;
    const gl = renderer.gl;
    const colorTexture = new Texture({ source: new TextureSource({ width: 4, height: 4, resolution: 1 }) });
    const renderTarget = new RenderTarget({ colorTextures: [colorTexture] });
    const integerTexture = new Texture({
        source: new BufferImageSource({ resource: texels, width: 2, height: 1, scaleMode: 'nearest' }),
    });

    const draw = (view: Container) =>
    {
        gl.getError();
        renderer.render({ target: renderTarget, container: view, clear: true, clearColor: [0, 0, 0, 1] });

        const error = gl.getError();
        const { pixels } = renderer.extract.pixels(colorTexture);

        return { error, pixel: Array.from(pixels.slice(0, 4)) };
    };

    const drawn = { error: gl.NO_ERROR, pixel: [255, 255, 255, 255] };

    return { renderer, integerTexture, draw, drawn };
}

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
        const { renderer, integerTexture, draw } = await setup();

        const quad = new Mesh({
            geometry: new Geometry({ attributes: { aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1] } }),
            shader: Shader.from({ gl: glShader, resources: { uData: integerTexture.source } }),
        });

        expect(draw(quad)).toEqual({ error: renderer.gl.NO_ERROR, pixel: [0, 255, 0, 255] });

        renderer.destroy();
    });

    it('should upload every integer format', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;
        const formats = nonCompressedFormats.filter(isIntegerFormat);
        const channels: Record<string, number> = { r: 1, rg: 2, rgba: 4 };
        const arrays: Record<string, new (length: number) => TypedArray> = {
            '8uint': Uint8Array,
            '8sint': Int8Array,
            '16uint': Uint16Array,
            '16sint': Int16Array,
            '32uint': Uint32Array,
            '32sint': Int32Array,
        };
        const failed: TEXTURE_FORMATS[] = [];

        expect(formats).toHaveLength(18);

        gl.getError();

        for (const format of formats)
        {
            const [, layout, texel] = format.match(/^(rgba|rg|r)(\d+[su]int)$/);
            const resource = new arrays[texel](channels[layout]);
            const source = new BufferImageSource({ resource, width: 1, height: 1, format, scaleMode: 'nearest' });

            renderer.texture.bind(new Texture({ source }));

            if (gl.getError() !== gl.NO_ERROR) failed.push(format);
        }

        expect(failed).toEqual([]);

        renderer.destroy();
    });

    it('should never premultiply an integer upload, even when alphaMode asks for it', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;
        // uses rgba8uint because a regressed 32-bit upload hangs the thread before jest's timeout can fire
        const source = new BufferImageSource({
            resource: new Uint8Array(4),
            width: 1,
            height: 1,
            format: 'rgba8uint',
            alphaMode: 'premultiply-alpha-on-upload',
        });

        renderer.texture.bind(new Texture({ source }));

        expect(gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL)).toBe(false);
        expect(gl.getError()).toBe(gl.NO_ERROR);

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
            const { renderer, integerTexture, draw, drawn } = await setup();
            const view = batchedViews[name]();

            // left on unit 1 by an earlier draw's bind
            renderer.texture.bind(integerTexture, 1);

            expect(draw(view)).toEqual(drawn);

            // left on unit 3 by an upload, which binds to the active unit without going through bind()
            renderer.texture.bind(Texture.WHITE, 3);
            integerTexture.source.update();

            expect(draw(view)).toEqual(drawn);

            renderer.destroy();
        },
    );

    it.each(['2d-array', 'cube'] as const)(
        'should not fail a sprite batch when a %s texture is bound over an integer texture, or unbound again',
        async (viewDimension) =>
        {
            const { renderer, integerTexture, draw, drawn } = await setup();
            const sprite = batchedViews.sprite();
            const otherTarget = new Texture({
                source: new TextureSource({
                    width: 1, height: 1, viewDimension, arrayLayerCount: viewDimension === 'cube' ? 6 : 2,
                }),
            });

            // binds unit 1's 2D-array or cube target, leaving the integer texture on its 2D target
            renderer.texture.bind(integerTexture, 1);
            renderer.texture.bind(otherTarget, 1);

            expect(draw(sprite)).toEqual(drawn);

            // unbinding it (as the GC does) clears only its own target, so the integer texture is still there
            renderer.texture.bind(integerTexture, 1);
            renderer.texture.bind(otherTarget, 1);
            renderer.texture.unbind(otherTarget);

            expect(draw(sprite)).toEqual(drawn);

            renderer.destroy();
        },
    );

    it('should not fail a sprite batch after resetState with an integer texture left on a unit', async () =>
    {
        const { renderer, integerTexture, draw, drawn } = await setup();
        const sprite = batchedViews.sprite();

        // left by an earlier draw; an app sharing the context with another GL library calls resetState each frame
        renderer.texture.bind(integerTexture, 1);
        renderer.resetState();

        expect(draw(sprite)).toEqual(drawn);

        renderer.destroy();
    });

    it('should not fail a sprite batch after resetState with an integer texture another library left on a unit', async () =>
    {
        const { renderer, draw, drawn } = await setup();
        const gl = renderer.gl;
        const sprite = batchedViews.sprite();

        // raw GL, as a library sharing the context would do; it sets its own unpack state before uploading
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, 1, 1, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, new Uint32Array(4));
        renderer.resetState();

        expect(draw(sprite)).toEqual(drawn);

        renderer.destroy();
    });

    it('should track which units hold integer textures', async () =>
    {
        const { renderer, integerTexture } = await setup();
        const textureSystem = renderer.texture;

        // unbindIntegerTextures only clears units from its location up
        textureSystem.bind(integerTexture, 1);
        textureSystem.bind(integerTexture, 6);
        textureSystem.unbindIntegerTextures(2);
        expect(textureSystem['_boundTextures'][1]).toBe(integerTexture.source);
        expect(textureSystem['_boundTextures'][6]).toBe(Texture.EMPTY.source);

        // a location past the mask clears nothing, rather than wrapping the shift back to unit 0
        textureSystem.unbindIntegerTextures(32);
        expect(textureSystem['_boundTextures'][1]).toBe(integerTexture.source);

        // resetState forgets every unit, so the next unbindIntegerTextures rebinds the empty texture over all of them
        textureSystem.resetState();
        textureSystem.unbindIntegerTextures(0);
        expect(textureSystem['_boundTextures'][0]).toBe(Texture.EMPTY.source);
        expect(textureSystem['_boundTextures'][renderer.limits.maxTextures - 1]).toBe(Texture.EMPTY.source);
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
