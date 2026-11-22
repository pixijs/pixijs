import { CanvasRenderer } from '../../../canvas/CanvasRenderer';
import { bgraToRgba } from '../../../gl/texture/utils/bgraToRgba';
import { BufferImageSource } from '../sources/BufferImageSource';
import { CompressedSource } from '../sources/CompressedSource';
import { Texture } from '../Texture';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { Sprite } from '~/scene';

import type { TEXTURE_FORMATS } from '../const';
import type { TextureSource } from '../sources/TextureSource';
import type { Renderer, WebGLRenderer } from '~/rendering';

const RED = [255, 0, 0, 255];
const GREEN = [0, 255, 0, 255];
const BLUE = [0, 0, 255, 255];
// red written as B, G, R, A
const RED_AS_BGRA = [0, 0, 255, 255];

// a colour given as R, G, B, A, as the Uint32 whose little-endian bytes are B, G, R, A
function asBgra([r, g, b, a]: number[]): number
{
    return ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
}

// [case, format, bytes, the colour every renderer must draw]
const cases: [string, TEXTURE_FORMATS | undefined, number[], number[]][] = [
    ['RGBA bytes with no format', undefined, RED, RED],
    ['BGRA bytes as bgra8unorm', 'bgra8unorm', RED_AS_BGRA, RED],
    ['RGBA bytes as rgba8unorm', 'rgba8unorm', RED, RED],
    ['RGBA bytes as bgra8unorm', 'bgra8unorm', RED, BLUE],
];

const sources: Record<string, (format: TEXTURE_FORMATS | undefined, bytes: number[]) => TextureSource> = {
    BufferImageSource: (format, bytes) =>
        new BufferImageSource({ resource: new Uint8Array(bytes), width: 1, height: 1, format }),
    CompressedSource: (format, bytes) =>
        new CompressedSource({ resource: [new Uint8Array(bytes)], width: 1, height: 1, format }),
};

const table = Object.keys(sources).flatMap((kind) => cases.map(([name, ...rest]) => [kind, name, ...rest] as const));

function drawnPixel(renderer: Renderer, source: TextureSource): number[]
{
    const sprite = new Sprite(new Texture({ source }));
    const pixel = Array.from(renderer.extract.pixels(sprite).pixels.slice(0, 4));

    sprite.destroy({ texture: true, textureSource: true });

    return pixel;
}

describe('Texture byte order', () =>
{
    describe.each([1, 2] as const)('on WebGL%i', (preferWebGLVersion) =>
    {
        let renderer: Renderer;

        beforeAll(async () =>
        {
            renderer = await getWebGLRenderer({ preferWebGLVersion });
        });

        afterAll(() => renderer.destroy());

        it.each(table)('should draw a %s holding %s', (kind, _, format, bytes, expected) =>
        {
            expect(drawnPixel(renderer, sources[kind](format, bytes))).toEqual(expected);
        });
    });

    describeLocalOnly('on WebGPU', () =>
    {
        let renderer: Renderer;

        beforeAll(async () =>
        {
            renderer = await getWebGPURenderer();
        });

        afterAll(() => renderer.destroy());

        it.each(table)('should draw a %s holding %s', (kind, _, format, bytes, expected) =>
        {
            expect(drawnPixel(renderer, sources[kind](format, bytes))).toEqual(expected);
        });
    });

    describe('on the canvas renderer', () =>
    {
        let renderer: CanvasRenderer;

        beforeAll(async () =>
        {
            renderer = new CanvasRenderer();
            await renderer.init({ width: 1, height: 1, backgroundAlpha: 0 });
        });

        afterAll(() => renderer.destroy());

        it.each(cases)('should draw a BufferImageSource holding %s', (_, format, bytes, expected) =>
        {
            const sprite = new Sprite(new Texture({ source: sources.BufferImageSource(format, bytes) }));

            renderer.render({ container: sprite });

            const context = renderer.canvas.getContext('2d') as CanvasRenderingContext2D;

            expect(Array.from(context.getImageData(0, 0, 1, 1).data)).toEqual(expected);

            sprite.destroy({ texture: true, textureSource: true });
        });
    });

    it('should not allocate while a bgra8unorm buffer is updated every frame on WebGL', async () =>
    {
        const renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });
        const source = new BufferImageSource({
            resource: new Uint8Array(64 * 64 * 4), width: 64, height: 64, format: 'bgra8unorm',
        });

        renderer.texture.initSource(source);

        // the shared swap buffer, which the first upload sized for this texture
        const scratch = bgraToRgba(new Uint8Array(4)).buffer;

        for (let i = 0; i < 100; i++) source.update();

        expect(bgraToRgba(new Uint8Array(4)).buffer).toBe(scratch);
        expect(scratch.byteLength).toBeGreaterThanOrEqual(64 * 64 * 4);

        source.destroy();
        renderer.destroy();
    });

    describe.each([1, 2] as const)('updating a bgra8unorm buffer on WebGL%i', (preferWebGLVersion) =>
    {
        let renderer: WebGLRenderer;

        beforeAll(async () =>
        {
            renderer = await getWebGLRenderer({ preferWebGLVersion });
        });

        afterAll(() => renderer.destroy());

        function createSource(width: number, height: number, colour: number[])
        {
            const data = new Uint8Array(width * height * 4);
            const texels = new Uint32Array(data.buffer);
            const source = new BufferImageSource({ resource: data, width, height, format: 'bgra8unorm' });

            texels.fill(asBgra(colour));

            return { data, texels, source, texture: new Texture({ source }) };
        }

        function drawnTexels(texture: Texture, indices: number[]): number[][]
        {
            const { pixels } = renderer.texture.getPixels(texture);

            return indices.map((i) => Array.from(pixels.slice(i * 4, (i * 4) + 4)));
        }

        it('should keep no swap buffer for a buffer over 1 MiB that is uploaded once', () =>
        {
            const { source, texture } = createSource(1024, 512, RED);

            renderer.texture.initSource(source);

            expect(renderer.texture.getGlSource(source)._bgraScratch).toBeNull();
            expect(drawnTexels(texture, [0])).toEqual([RED]);

            texture.destroy(true);
        });

        it('should swap every update of a buffer over 1 MiB into one buffer its texture keeps', () =>
        {
            const width = 1024;
            const { data, texels, source, texture } = createSource(width, 512, RED);

            renderer.texture.initSource(source);
            source.update();

            const glTexture = renderer.texture.getGlSource(source);
            const kept = glTexture._bgraScratch;

            expect(kept.byteLength).toBe(data.byteLength);

            texels.fill(asBgra(BLUE));
            for (let i = 0; i < 10; i++) source.update();

            expect(glTexture._bgraScratch).toBe(kept);
            // the uploaded bytes went through the kept buffer
            expect(Array.from(new Uint8Array(kept, data.byteLength - 4))).toEqual(BLUE);
            expect(drawnTexels(texture, [0, texels.length >> 1, texels.length - 1])).toEqual([BLUE, BLUE, BLUE]);

            // a partial row, 349 whole rows (over 1 MiB) and a partial row, each uploaded as its own rect
            const start = (width * 100) + 5;
            const end = (width * 450) + 7;

            texels.fill(asBgra(GREEN));
            source.update(start, end);

            expect(glTexture._bgraScratch).toBe(kept);
            expect(drawnTexels(texture, [start - 1, start, start + width, end - 1, end]))
                .toEqual([BLUE, GREEN, GREEN, GREEN, BLUE]);

            texture.destroy(true);
        });

        it('should upload the texels in a ranged update with red and blue swapped', () =>
        {
            const { texels, source, texture } = createSource(4, 2, RED);

            renderer.texture.initSource(source);

            texels.fill(asBgra(BLUE), 2);
            // texel 3 ends row 0 and texels 4 to 6 start row 1, so this uploads two rects
            source.update(3, 7);

            expect(drawnTexels(texture, [0, 1, 2, 3, 4, 5, 6, 7]))
                .toEqual([RED, RED, RED, BLUE, BLUE, BLUE, BLUE, RED]);

            texture.destroy(true);
        });
    });

    it('should upload and update a bgra8unorm 2D array over 1 MiB on WebGL2', async () =>
    {
        const renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });
        const gl = renderer.gl as WebGL2RenderingContext;
        const size = 512;
        const layerTexels = size * size;
        const texels = new Uint32Array(layerTexels * 2);
        const source = new BufferImageSource({
            resource: new Uint8Array(texels.buffer), width: size, height: size, arrayLayerCount: 2, format: 'bgra8unorm',
        });

        texels.fill(asBgra(RED), 0, layerTexels);
        texels.fill(asBgra(GREEN), layerTexels);
        renderer.texture.initSource(source);

        const glTexture = renderer.texture.getGlSource(source);

        function drawnLayer(layer: number): number[]
        {
            const framebuffer = gl.createFramebuffer();
            const pixel = new Uint8Array(4);

            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, glTexture.texture, 0, layer);
            gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.deleteFramebuffer(framebuffer);

            return Array.from(pixel);
        }

        expect([drawnLayer(0), drawnLayer(1)]).toEqual([RED, GREEN]);
        expect(glTexture._bgraScratch).toBeNull();

        texels.fill(asBgra(BLUE), layerTexels);
        source.update();

        const kept = glTexture._bgraScratch;

        source.update();

        expect(kept.byteLength).toBe(texels.byteLength);
        expect(glTexture._bgraScratch).toBe(kept);
        expect(Array.from(new Uint8Array(kept, texels.byteLength - 4))).toEqual(BLUE);
        expect([drawnLayer(0), drawnLayer(1)]).toEqual([RED, BLUE]);
        expect(gl.getError()).toBe(gl.NO_ERROR);

        source.destroy();
        renderer.destroy();
    });
});
