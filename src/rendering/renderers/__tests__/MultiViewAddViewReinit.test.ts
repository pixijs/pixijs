import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { Container } from '~/scene';

function createCanvas(width = 16, height = 16)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

describe('MultiView addView re-init after direct render (WebGL)', () =>
{
    it('invalidates a gpu render target already created by a direct render so addView flags take effect', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 16, height: 16, multiView: true });

        const canvas = createCanvas();

        // render directly to the canvas first: this creates and caches its gpu render target before any
        // addView latch, so ViewSystem.addView's antialias / transparent flags would otherwise be ignored
        renderer.render({ container: new Container(), target: canvas });

        const target = renderer.renderTarget.getRenderTarget(canvas);
        const before = renderer.renderTarget.getGpuRenderTarget(target);

        expect(renderer.renderTarget.hasGpuRenderTarget(target)).toBe(true);

        renderer.addView({ canvas, antialias: true });

        // addView must have dropped the stale gpu render target; a fresh lookup rebuilds a new one
        const after = renderer.renderTarget.getGpuRenderTarget(target);

        expect(after).not.toBe(before);

        renderer.destroy();
    });
});

describe('MultiView addView re-init after direct render (WebGPU)', () =>
{
    itLocalOnly('re-inits MSAA on a gpu render target already created by a direct render', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 16, height: 16 });

        const canvas = createCanvas();

        renderer.render({ container: new Container(), target: canvas });

        const target = renderer.renderTarget.getRenderTarget(canvas);

        // the direct render cached a non-MSAA gpu render target
        expect(renderer.renderTarget.getGpuRenderTarget(target).msaa).toBe(false);

        renderer.addView({ canvas, antialias: true });
        renderer.render({ container: new Container(), target: canvas });

        // after invalidation the re-inited gpu render target reads the latched antialias flag
        expect(renderer.renderTarget.getGpuRenderTarget(target).msaa).toBe(true);

        renderer.destroy();
    });
});
