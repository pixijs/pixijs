import { getWebGLRenderer } from '@test-utils';
import { CanvasPool, TexturePool } from '~/rendering';

describe('ViewSystem', () =>
{
    it('should register the screen size with both pools on init', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 640, height: 480, resolution: 2 });

        const texture = TexturePool.getOptimalTexture({ width: 640, height: 480, resolution: 2 });
        const { canvas } = CanvasPool.getOptimalCanvasAndContext(640, 480, 2);

        expect([texture.source.pixelWidth, texture.source.pixelHeight]).toEqual([1280, 960]);
        expect([canvas.width, canvas.height]).toEqual([1280, 960]);

        TexturePool.returnTexture(texture);
        renderer.destroy();
    });

    it('should re-register both pools when the renderer is resized', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 640, height: 480, resolution: 2 });

        const before = TexturePool.getOptimalTexture({ width: 640, height: 480, resolution: 2 });

        TexturePool.returnTexture(before);

        renderer.resize(320, 240);

        // the 1280x960 bucket no longer matches a screen, so it was pruned
        expect(before.destroyed).toBe(true);

        const after = TexturePool.getOptimalTexture({ width: 320, height: 240, resolution: 2 });
        const { canvas } = CanvasPool.getOptimalCanvasAndContext(320, 240, 2);

        expect([after.source.pixelWidth, after.source.pixelHeight]).toEqual([640, 480]);
        expect([canvas.width, canvas.height]).toEqual([640, 480]);

        TexturePool.returnTexture(after);
        renderer.destroy();
    });

    it('should register the screen in physical pixels when the resolution changes', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 640, height: 480, resolution: 1 });

        const before = TexturePool.getOptimalTexture({ width: 640, height: 480 });

        expect([before.source.pixelWidth, before.source.pixelHeight]).toEqual([640, 480]);
        TexturePool.returnTexture(before);

        renderer.resize(640, 480, 3);

        const after = TexturePool.getOptimalTexture({ width: 640, height: 480, resolution: 3 });
        const { canvas } = CanvasPool.getOptimalCanvasAndContext(640, 480, 3);

        expect([after.source.pixelWidth, after.source.pixelHeight]).toEqual([1920, 1440]);
        expect([canvas.width, canvas.height]).toEqual([1920, 1440]);

        TexturePool.returnTexture(after);
        renderer.destroy();
    });

    it('should remove the screen from both pools when the renderer is destroyed', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 640, height: 480, resolution: 2 });

        renderer.destroy();

        const texture = TexturePool.getOptimalTexture({ width: 640, height: 480, resolution: 2 });
        const { canvas } = CanvasPool.getOptimalCanvasAndContext(640, 480, 2);

        expect([texture.source.pixelWidth, texture.source.pixelHeight]).toEqual([2048, 1024]);
        expect([canvas.width, canvas.height]).toEqual([2048, 1024]);

        TexturePool.returnTexture(texture);
    });
});
