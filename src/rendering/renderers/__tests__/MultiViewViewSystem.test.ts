import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { Container } from '~/scene';

function createCanvas(width = 100, height = 100)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

describe('MultiView ViewSystem.addView', () =>
{
    it('should apply the renderer antialias / transparent defaults to the view source', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true, antialias: true, backgroundAlpha: 0.5 });
        const canvas = createCanvas();

        const view = renderer.addView({ canvas });

        expect(view.source.antialias).toBe(true);
        expect(view.source.transparent).toBe(true);
        expect(view.antialias).toBe(true);
        expect(view.transparent).toBe(true);

        renderer.destroy();
    });

    it('should honour per-view antialias / transparent overrides', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true, antialias: true, backgroundAlpha: 1 });
        const canvas = createCanvas();

        const view = renderer.addView({ canvas, antialias: false, transparent: true });

        expect(view.source.antialias).toBe(false);
        expect(view.source.transparent).toBe(true);
        expect(view.antialias).toBe(false);
        expect(view.transparent).toBe(true);

        renderer.destroy();
    });

    it('should default transparent from the renderer background alpha', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true, backgroundAlpha: 1 });
        const canvas = createCanvas();

        const view = renderer.addView({ canvas });

        expect(view.source.transparent).toBe(false);
        expect(view.transparent).toBe(false);

        renderer.destroy();
    });

    it('should default roundPixels from the renderer', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true, roundPixels: true });
        const canvas = createCanvas();

        const view = renderer.addView({ canvas });

        expect(view.roundPixels).toBe(true);

        renderer.destroy();
    });
});

describe('MultiView ViewSystem.removeView', () =>
{
    it('should free the render target while keeping the canvas source alive', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const view = renderer.addView({ canvas });
        const source = view.source;
        const originalUid = renderer.renderTarget.getRenderTarget(canvas).uid;

        renderer.removeView(view);

        // the source survives the release
        expect(source.destroyed).toBe(false);

        // a fresh lookup rebuilds a brand new render target (different uid)
        const newUid = renderer.renderTarget.getRenderTarget(canvas).uid;

        expect(newUid).not.toBe(originalUid);

        renderer.destroy();
    });

    it('should never release the main view', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });

        const mainView = renderer.view.views[0];
        const mainUid = renderer.view.renderTarget.uid;

        renderer.removeView(mainView);

        // the main render target is untouched
        expect(renderer.view.renderTarget.uid).toBe(mainUid);
        expect(renderer.renderTarget.getRenderTarget(renderer.canvas)).toBe(renderer.view.renderTarget);

        renderer.destroy();
    });
});

describe('MultiView ViewSystem (WebGPU)', () =>
{
    itLocalOnly('should latch MSAA onto the gpu render target for an antialiased view', async () =>
    {
        const renderer = await getWebGPURenderer({});
        const canvas = createCanvas(16, 16);

        const view = renderer.addView({ canvas, antialias: true });

        renderer.render({ container: new Container(), target: canvas });

        const gpuRenderTarget = renderer.renderTarget.getGpuRenderTarget(view.renderTarget);

        expect(gpuRenderTarget.msaa).toBe(true);

        renderer.destroy();
    });

    itLocalOnly('should unconfigure the canvas so it can be re-added without throwing', async () =>
    {
        const renderer = await getWebGPURenderer({});
        const canvas = createCanvas(16, 16);

        const view = renderer.addView({ canvas });

        renderer.render({ container: new Container(), target: canvas });
        renderer.removeView(view);

        expect(() =>
        {
            const reView = renderer.addView({ canvas });

            renderer.render({ container: new Container(), target: canvas });
            renderer.removeView(reView);
        }).not.toThrow();

        renderer.destroy();
    });
});
