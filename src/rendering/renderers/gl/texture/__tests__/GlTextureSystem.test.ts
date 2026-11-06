import { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { getWebGLRenderer, loseAndRestoreContext } from '@test-utils';
import { Container, Sprite } from '~/scene';

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

    it('should draw a batch on every texture unit after the context is restored', async () =>
    {
        renderer = await getWebGLRenderer();

        // fills every unit the batcher uses; the regression needs more than 16, as SwiftShader reports
        const count = renderer.limits.maxBatchableTextures;
        const stage = new Container();

        for (let i = 0; i < count; i++)
        {
            const texture = new Texture({
                source: new BufferImageSource({
                    resource: new Uint8Array([i * 7, 255, 0, 255]),
                    width: 1,
                    height: 1,
                    scaleMode: 'nearest',
                }),
            });

            stage.addChild(new Sprite({ texture, x: i }));
        }

        const columns = () => Array.from(renderer.extract.pixels(stage).pixels.slice(0, count * 4));
        const expected = Array.from({ length: count }, (_, i) => [i * 7, 255, 0, 255]).flat();

        expect(columns()).toEqual(expected);

        await loseAndRestoreContext(renderer);

        expect(columns()).toEqual(expected);
    });
});
