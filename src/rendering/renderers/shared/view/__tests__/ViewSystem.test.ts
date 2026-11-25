import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { CanvasPool, TexturePool, TextureSource } from '~/rendering';

describe('ViewSystem', () =>
{
    it('should give depth to the render target, not the canvas texture', async () =>
    {
        const renderer = await getWebGLRenderer({ depth: true });
        const source = renderer.view.texture.source;

        // the renderer's depth asks for a depth buffer; on the canvas source it would make a 3D texture
        expect(source.dimension).toBe('2d');
        expect(source.depth).toBe(1);
        expect(renderer.view.renderTarget.depth).toBe(true);

        renderer.destroy();
    });

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

    it('should register the resolution of the screen with the texture pool', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 393, height: 852, resolution: 3 });

        const before = TexturePool.getOptimalTexture({ width: 393, height: 852 });

        expect([before.source.pixelWidth, before.source.pixelHeight]).toEqual([393, 852]);
        TexturePool.returnTexture(before);

        // the same 1179x2556 pixels, so only the resolution is new
        renderer.resize(1179, 2556, 1);

        const after = TexturePool.getOptimalTexture({ width: 393, height: 852 });

        expect([after.source.pixelWidth, after.source.pixelHeight]).toEqual([512, 1024]);

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

    itLocalOnly('should set up the WebGPU canvas in the preferred format by default', async () =>
    {
        const preferred = navigator.gpu.getPreferredCanvasFormat();
        const originalFormat = TextureSource.defaultOptions.format;

        // set the texture default to the other format, so a canvas that just took it fails the test
        TextureSource.defaultOptions.format = preferred === 'bgra8unorm' ? 'rgba8unorm' : 'bgra8unorm';

        const renderer = await getWebGPURenderer();

        try
        {
            expect(renderer.view.texture.source.format).toBe(preferred);
        }
        finally
        {
            TextureSource.defaultOptions.format = originalFormat;
            renderer.destroy();
        }
    });

    itLocalOnly('should keep an explicit WebGPU canvas format', async () =>
    {
        const renderer = await getWebGPURenderer({ format: 'rgba16float' });

        expect(renderer.view.texture.source.format).toBe('rgba16float');

        renderer.destroy();
    });
});
