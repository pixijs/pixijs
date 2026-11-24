import { RenderTexture } from '../../../shared/texture/RenderTexture';
import { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import { CompressedSource } from '../../../shared/texture/sources/CompressedSource';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { getWebGLRenderer } from '@test-utils';
import { Graphics, Sprite } from '~/scene';

import type { WebGLRenderer } from '../../WebGLRenderer';

describe('GlTextureSystem', () =>
{
    let renderer: WebGLRenderer;

    afterEach(() =>
    {
        renderer?.destroy();
        renderer = null;
    });

    it('should count the mip levels of a 3D texture along its depth', async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });

        const source = new TextureSource({ width: 2, height: 2, depth: 8, autoGenerateMipmaps: true });

        renderer.texture.initSource(source);

        expect(source.mipLevelCount).toBe(4);
    });

    it('should leave no GL error when creating or restyling a texture on WebGL1', async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 1 });

        const gl = renderer.gl;

        expect(renderer.context.webGLVersion).toBe(1);

        // clear errors from renderer init so each assertion checks only its own step
        gl.getError();

        const source = new TextureSource({ width: 1, height: 1 });

        renderer.texture.initSource(source);

        expect(gl.getError()).toBe(gl.NO_ERROR);

        source.style.addressMode = 'repeat';
        source.style.update();

        expect(gl.getError()).toBe(gl.NO_ERROR);
    });

    it('should keep mip filtering on WebGL1 for a render texture resized to a power of two', async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 1 });

        const renderTexture = RenderTexture.create({ width: 12, height: 12, mipLevelCount: 4, autoGenerateMipmaps: true });
        const checkerboard = new Graphics();

        for (let y = 0; y < 16; y++)
        {
            for (let x = 0; x < 16; x++)
            {
                checkerboard.rect(x, y, 1, 1).fill((x + y) % 2 ? 0xffffff : 0x000000);
            }
        }

        // created at a size WebGL1 can't mipmap, then resized to one it can
        renderer.texture.initSource(renderTexture.source);
        renderTexture.resize(16, 16);
        renderer.render({ container: checkerboard, target: renderTexture });
        renderTexture.source.updateMipmaps();

        const sprite = new Sprite(renderTexture);
        const target = RenderTexture.create({ width: 5, height: 5 });

        sprite.setSize(5);
        renderer.render({ container: sprite, target });

        // minified with mips, a 1px checkerboard averages to grey; without them it aliases
        const { pixels } = renderer.extract.pixels(target);

        for (let i = 0; i < pixels.length; i += 4)
        {
            expect(pixels[i]).toBeWithin(118, 139);
        }
    });

    it('should draw the first level of a compressed texture that is not a power of two on WebGL1', async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 1 });

        const level = (size: number, rgba: number[]) => new Uint8Array(size * size * 4).map((_, i) => rgba[i % 4]);
        const source = new CompressedSource({
            resource: [level(6, [255, 0, 0, 255]), level(3, [0, 255, 0, 255]), level(1, [0, 0, 255, 255])],
            width: 6,
            height: 6,
            format: 'rgba8unorm',
        });

        renderer.gl.getError();

        const { pixels } = renderer.extract.pixels(new Sprite(new Texture({ source })));

        expect(Array.from(pixels.subarray(0, 4))).toEqual([255, 0, 0, 255]);
        expect(renderer.gl.getError()).toBe(renderer.gl.NO_ERROR);
    });

    // any depth makes a 3D texture, so the 2D case leaves it out
    it.each([
        ['2D', undefined],
        ['3D', 2],
    ] as const)('should upload a %s buffer with unaligned rows and leave the unpack alignment at 4', async (_, depth) =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });

        const gl = renderer.gl;

        gl.getError();

        const source = new BufferImageSource({
            resource: new Uint8Array(3 * 3 * (depth ?? 1)), width: 3, height: 3, depth, format: 'r8unorm',
        });

        renderer.texture.initSource(source);

        expect(gl.getError()).toBe(gl.NO_ERROR);
        expect(gl.getParameter(gl.UNPACK_ALIGNMENT)).toBe(4);
    });

    it.each(['rgba8unorm', 'bgra8unorm'] as const)(
        'should draw into an antialiased %s render texture on WebGL2',
        async (format) =>
        {
            renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });

            const gl = renderer.gl;

            expect(renderer.context.webGLVersion).toBe(2);

            const target = RenderTexture.create({ width: 4, height: 4, format, antialias: true });
            const container = new Graphics().rect(0, 0, 4, 4).fill(0xff0000);

            gl.getError();

            renderer.render({ container, target });

            expect(gl.getError()).toBe(gl.NO_ERROR);
            expect(Array.from(renderer.extract.pixels(target).pixels.subarray(0, 4))).toEqual([255, 0, 0, 255]);

            container.destroy();
            target.destroy(true);
        }
    );
});
